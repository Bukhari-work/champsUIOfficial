import { createHmac, randomUUID } from "node:crypto";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  language: "en" | "id";
}

export interface ContactStore {
  find(id: string): Promise<ContactMessage | undefined>;
  save(message: ContactMessage): Promise<boolean>;
  consumeLimit(key: string, limit: number, expiresAt: Date): Promise<boolean>;
  markNotified(id: string, notificationId: string): Promise<void>;
  pending(limit: number): Promise<ContactMessage[]>;
  cleanupLimits(): Promise<void>;
}

export interface ContactConfig {
  databaseUrl: string;
  apiKey: string;
  from: string;
  to: string;
  rateLimitSecret: string;
}

export function contactConfig(
  env: Record<string, string | undefined>,
): ContactConfig | undefined {
  if (env.CONTACT_FORM_BACKEND !== "vercel") return;
  const config = {
    databaseUrl: env.DATABASE_URL ?? "",
    apiKey: env.RESEND_API_KEY ?? "",
    from: env.CONTACT_EMAIL_FROM ?? "",
    to: env.CONTACT_EMAIL_TO ?? "",
    rateLimitSecret: env.CONTACT_RATE_LIMIT_SECRET ?? "",
  };
  if (Object.values(config).some((value) => !value.trim())) return;
  if (config.rateLimitSecret.length < 32) return;
  return config;
}

function bucket(key: string, seconds: number, now: number) {
  const window = Math.floor(now / (seconds * 1000));
  return {
    key: `${key}:${window}`,
    expiresAt: new Date((window + 1) * seconds * 1000),
  };
}

export async function notifyContact(
  message: ContactMessage,
  config: ContactConfig,
  store: ContactStore,
  send: typeof fetch = fetch,
): Promise<boolean> {
  // Leave room under Resend Free's daily allowance. Shared by requests/retries.
  const budget = bucket("notification", 86400, Date.now());
  if (!(await store.consumeLimit(budget.key, 90, budget.expiresAt)))
    return false;
  const response = await send("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `contact/${message.id}`,
    },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      reply_to: message.email,
      subject: "CHAMPS UI website contact inquiry",
      text: `Name: ${message.name}\nEmail: ${message.email}\nLanguage: ${message.language}\nReference: ${message.id}\n\n${message.message}`,
    }),
  });
  if (!response.ok) throw new Error("Contact notification rejected.");
  const result = await response.json();
  if (typeof result.id !== "string")
    throw new Error("Contact notification response invalid.");
  await store.markNotified(message.id, result.id);
  return true;
}

function reply(
  request: Request,
  status: number,
  code: string,
  language = "en",
) {
  const headers = {
    "Cache-Control": "no-store",
    ...(status === 429 ? { "Retry-After": "3600" } : {}),
  };
  if (request.headers.get("accept")?.includes("text/html")) {
    const success = status === 200;
    const text =
      language === "id"
        ? success
          ? "Terima kasih. Pesan Anda telah diterima."
          : "Pesan belum dapat dikirim. Silakan kembali dan coba lagi atau email CHAMPS UI."
        : success
          ? "Thank you. Your message has been received."
          : "Your message could not be submitted. Please go back and try again or email CHAMPS UI.";
    const path = language === "id" ? "/id/contact" : "/contact";
    return new Response(
      `<!doctype html><html lang="${language === "id" ? "id" : "en"}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>CHAMPS UI — Contact</title><main style="font:1rem/1.6 system-ui;max-width:40rem;margin:10vh auto;padding:1.5rem"><h1>CHAMPS UI</h1><p>${text}</p><p><a href="${path}">${language === "id" ? "Kembali ke kontak" : "Back to contact"}</a></p><a href="mailto:champs@ui.ac.id">champs@ui.ac.id</a></main></html>`,
      {
        status,
        headers: {
          ...headers,
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
        },
      },
    );
  }
  return Response.json(
    { status: status === 200 ? "success" : "error", code },
    { status, headers },
  );
}

async function readFields(request: Request): Promise<Record<string, unknown>> {
  // Bound actual bytes, including requests without a Content-Length header.
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Empty body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 65536) {
      await reader.cancel();
      throw new Error("Body too large");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const type = request.headers.get("content-type") ?? "";
  if (type.startsWith("application/json")) {
    const parsed = JSON.parse(new TextDecoder().decode(body));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error("Invalid body");
    return parsed;
  }
  if (
    !type.startsWith("multipart/form-data") &&
    !type.startsWith("application/x-www-form-urlencoded")
  )
    throw new Error("Invalid content type");
  const data = await new Response(body, {
    headers: { "Content-Type": type },
  }).formData();
  return Object.fromEntries(data);
}

type Dependencies = {
  store: (config: ContactConfig) => ContactStore;
  notify?: typeof notifyContact;
  log?: (event: string, id?: string) => void;
};

export function createContactHandler(dependencies: Dependencies) {
  return async (request: Request, ip: string, config?: ContactConfig) => {
    if (request.method !== "POST")
      return new Response(null, {
        status: 405,
        headers: { Allow: "POST", "Cache-Control": "no-store" },
      });
    if (request.headers.get("origin") !== new URL(request.url).origin)
      return reply(request, 403, "INVALID_ORIGIN");
    let fields: Record<string, unknown>;
    try {
      fields = await readFields(request);
    } catch {
      return reply(request, 400, "INVALID_FIELDS");
    }
    const language = fields.language === "id" ? "id" : "en";
    if (typeof fields.website === "string" && fields.website.trim())
      return reply(request, 200, "RECEIVED", language);
    const text = (key: string) =>
      typeof fields[key] === "string" ? fields[key].trim() : "";
    const message: ContactMessage = {
      id: (text("submission_id") || randomUUID()).toLowerCase(),
      name: text("name"),
      email: text("email"),
      message: text("message"),
      language,
    };
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        message.id,
      ) ||
      !message.name ||
      message.name.length > 120 ||
      /[\r\n\x00]/.test(message.name) ||
      message.email.length > 254 ||
      /[\x00-\x1f\x7f]/.test(message.email) ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(message.email) ||
      !message.message ||
      message.message.length > 10000 ||
      message.message.includes("\x00")
    ) {
      return reply(request, 400, "INVALID_FIELDS", language);
    }
    if (!config) return reply(request, 503, "UNAVAILABLE", language);
    try {
      const store = dependencies.store(config);
      const existing = await store.find(message.id);
      if (existing) {
        if (
          existing.name !== message.name ||
          existing.email !== message.email ||
          existing.message !== message.message ||
          existing.language !== message.language
        )
          return reply(request, 409, "ID_CONFLICT", language);
        return reply(request, 200, "RECEIVED", language);
      }
      const hash = (value: string) =>
        createHmac("sha256", config.rateLimitSecret)
          .update(value)
          .digest("hex");
      const now = Date.now();
      for (const limit of [
        { ...bucket(`ip:${hash(ip)}`, 3600, now), max: 5 },
        {
          ...bucket(`email:${hash(message.email.toLowerCase())}`, 3600, now),
          max: 5,
        },
        { ...bucket("submission", 86400, now), max: 100 },
      ]) {
        if (!(await store.consumeLimit(limit.key, limit.max, limit.expiresAt)))
          return reply(request, 429, "RATE_LIMITED", language);
      }
      const created = await store.save(message);
      if (created) {
        try {
          await (dependencies.notify ?? notifyContact)(message, config, store);
        } catch {
          dependencies.log?.("contact.notification_pending", message.id);
        }
      } else {
        // Another request may have inserted this ID after our initial lookup.
        const saved = await store.find(message.id);
        if (
          !saved ||
          saved.name !== message.name ||
          saved.email !== message.email ||
          saved.message !== message.message ||
          saved.language !== message.language
        )
          return reply(request, 409, "ID_CONFLICT", language);
      }
      return reply(request, 200, "RECEIVED", language);
    } catch {
      // Do not log contact contents, addresses, connection strings or API keys.
      dependencies.log?.("contact.storage_failed", message.id);
      return reply(request, 503, "UNAVAILABLE", language);
    }
  };
}
