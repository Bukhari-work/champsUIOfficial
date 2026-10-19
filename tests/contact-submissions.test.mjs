import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import {
  contactConfig,
  createContactHandler,
  notifyContact,
} from "../src/server/contact.ts";

const config = {
  databaseUrl: "postgres://placeholder",
  apiKey: "placeholder-key",
  from: "CHAMPS UI <website@mail.champs-ui.org>",
  to: "team@example.org",
  rateLimitSecret: "a".repeat(64),
};
const fields = () => ({
  submission_id: randomUUID(),
  name: "Test Visitor",
  email: "visitor@example.org",
  message: "I would like to learn more about your work.",
  language: "en",
  website: "",
});
function request(values = fields(), options = {}) {
  return new Request("https://www.champs-ui.org/api/contact", {
    method: "POST",
    headers: {
      Origin: "https://www.champs-ui.org",
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    body: JSON.stringify(values),
  });
}
function fixture() {
  const rows = new Map();
  const sent = [];
  const counts = new Map();
  const logs = [];
  const store = {
    async find(id) {
      return rows.get(id);
    },
    async save(message) {
      if (rows.has(message.id)) return false;
      rows.set(message.id, { ...message });
      return true;
    },
    async consumeLimit(key, max) {
      const count = (counts.get(key) ?? 0) + 1;
      counts.set(key, count);
      return count <= max;
    },
    async markNotified() {},
    async pending() {
      return [...rows.values()];
    },
    async cleanupLimits() {},
  };
  const handle = createContactHandler({
    store: () => store,
    notify: async (message) => {
      sent.push(message);
      return true;
    },
    log: (...args) => logs.push(args),
  });
  return { rows, sent, counts, logs, store, handle };
}

test("activation requires the flag and all private settings", () => {
  assert.equal(contactConfig({}), undefined);
  const env = {
    CONTACT_FORM_BACKEND: "vercel",
    DATABASE_URL: config.databaseUrl,
    RESEND_API_KEY: config.apiKey,
    CONTACT_EMAIL_FROM: config.from,
    CONTACT_EMAIL_TO: config.to,
    CONTACT_RATE_LIMIT_SECRET: config.rateLimitSecret,
  };
  assert.deepEqual(contactConfig(env), config);
  assert.equal(contactConfig({ ...env, RESEND_API_KEY: "" }), undefined);
  assert.equal(
    contactConfig({ ...env, CONTACT_RATE_LIMIT_SECRET: "short" }),
    undefined,
  );
  assert.equal(
    contactConfig({ ...env, CONTACT_FORM_BACKEND: "legacy" }),
    undefined,
  );
});

test("disabled and cross-origin submissions cannot reach storage", async () => {
  const handle = createContactHandler({
    store: () => {
      throw new Error("must not access storage");
    },
  });
  assert.equal((await handle(request(), "127.0.0.1")).status, 503);
  assert.equal(
    (
      await handle(
        request(fields(), { headers: { Origin: "https://other.example" } }),
        "127.0.0.1",
        config,
      )
    ).status,
    403,
  );
  const method = await handle(
    new Request("https://www.champs-ui.org/api/contact"),
    "127.0.0.1",
    config,
  );
  assert.equal(method.status, 405);
  assert.equal(method.headers.get("allow"), "POST");
});

test("invalid fields and oversized bodies are rejected before persistence", async () => {
  const { handle, rows, sent } = fixture();
  for (const value of [
    { ...fields(), name: "Injected\r\nHeader" },
    { ...fields(), name: "" },
    { ...fields(), email: "invalid" },
    { ...fields(), email: "x\0@example.org" },
    { ...fields(), message: "x".repeat(10001) },
    { ...fields(), message: "" },
    { ...fields(), submission_id: "invalid-id" },
    { ...fields(), message: "é".repeat(40000) },
  ])
    assert.equal(
      (await handle(request(value), "127.0.0.1", config)).status,
      400,
    );
  assert.equal(rows.size, 0);
  assert.equal(sent.length, 0);
});

test("honeypot submissions receive a neutral result without writes or mail", async () => {
  const { handle, rows, counts, sent } = fixture();
  assert.equal(
    (
      await handle(
        request({ ...fields(), website: "spam.example" }),
        "127.0.0.1",
        config,
      )
    ).status,
    200,
  );
  assert.equal(rows.size, 0);
  assert.equal(counts.size, 0);
  assert.equal(sent.length, 0);
});

test("a successful submission is saved before notification, and an identical retry is deduplicated", async () => {
  const { handle, rows, sent } = fixture();
  const data = fields();
  const first = await handle(request(data), "127.0.0.1", config);
  assert.equal(first.status, 200);
  assert.equal(first.headers.get("cache-control"), "no-store");
  assert.equal(rows.size, 1);
  assert.equal(sent.length, 1);
  assert.equal(rows.get(data.submission_id).message, data.message);
  const retry = await handle(request(data), "127.0.0.1", config);
  assert.equal(retry.status, 200);
  assert.equal(rows.size, 1);
  assert.equal(sent.length, 1);
  const changed = await handle(
    request({ ...data, message: "Different contents" }),
    "127.0.0.1",
    config,
  );
  assert.equal(changed.status, 409);
  assert.equal(rows.size, 1);
});

test("an insert race with different contents does not silently accept an unsaved message", async () => {
  const { store } = fixture();
  let calls = 0;
  const data = fields();
  store.find = async () =>
    ++calls === 1 ? undefined : { ...data, message: "Different contents" };
  store.save = async () => false;
  const handle = createContactHandler({
    store: () => store,
    notify: async () => {
      assert.fail("must not send");
    },
  });
  assert.equal((await handle(request(data), "127.0.0.1", config)).status, 409);
});

test("a notification failure keeps the saved inquiry and returns receipt", async () => {
  const { store, rows, logs } = fixture();
  const handle = createContactHandler({
    store: () => store,
    notify: async () => {
      throw new Error("provider unavailable");
    },
    log: (...args) => logs.push(args),
  });
  const result = await handle(request(), "127.0.0.1", config);
  assert.equal(result.status, 200);
  assert.equal(rows.size, 1);
  assert.equal(logs[0][0], "contact.notification_pending");
  assert.doesNotMatch(
    JSON.stringify(logs),
    /visitor@example|provider unavailable/,
  );
});

test("database failure returns an error without sending a notification", async () => {
  const { store, sent } = fixture();
  store.save = async () => {
    throw new Error("database credentials must not leak");
  };
  const handle = createContactHandler({
    store: () => store,
    notify: async () => {
      sent.push(1);
    },
  });
  const result = await handle(request(), "127.0.0.1", config);
  assert.equal(result.status, 503);
  assert.equal(sent.length, 0);
  assert.doesNotMatch(await result.text(), /credentials/);
});

test("new submissions are rate limited while retries still succeed; keys contain no raw IP or email", async () => {
  const { handle, rows, counts } = fixture();
  const original = fields();
  assert.equal(
    (await handle(request(original), "127.0.0.1", config)).status,
    200,
  );
  for (let i = 1; i < 5; i++)
    assert.equal((await handle(request(), "127.0.0.1", config)).status, 200);
  const limited = await handle(request(), "127.0.0.1", config);
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "3600");
  assert.equal(rows.size, 5);
  assert.equal(
    (await handle(request(original), "127.0.0.1", config)).status,
    200,
  );
  assert.doesNotMatch(
    [...counts.keys()].join(" "),
    /127\.0\.0\.1|visitor@example\.org/,
  );
});

test("native form posts get localized HTML feedback and never echo submitted content", async () => {
  const { handle, rows } = fixture();
  const data = {
    ...fields(),
    language: "id",
    name: "<script>alert(1)</script>",
  };
  const req = new Request("https://www.champs-ui.org/api/contact", {
    method: "POST",
    headers: { Origin: "https://www.champs-ui.org", Accept: "text/html" },
    body: new URLSearchParams(data),
  });
  const result = await handle(req, "127.0.0.1", config);
  assert.equal(result.status, 200);
  assert.equal(rows.size, 1);
  assert.match(result.headers.get("content-type"), /text\/html/);
  const html = await result.text();
  assert.match(html, /lang="id"/);
  assert.match(html, /Pesan Anda telah diterima/);
  assert.doesNotMatch(html, /<script>/);
});

test("notifications use verified From, visitor Reply-To, plain text, and a stable idempotency key", async () => {
  const { store } = fixture();
  const data = { ...fields(), id: randomUUID() };
  let body;
  let key;
  let marked;
  store.markNotified = async (...args) => {
    marked = args;
  };
  const send = async (url, init) => {
    assert.equal(url, "https://api.resend.com/emails");
    body = JSON.parse(init.body);
    key = init.headers["Idempotency-Key"];
    return Response.json({ id: "notification-id" });
  };
  assert.equal(await notifyContact(data, config, store, send), true);
  assert.equal(body.from, config.from);
  assert.deepEqual(body.to, [config.to]);
  assert.equal(body.reply_to, data.email);
  assert.equal(body.html, undefined);
  assert.equal(key, `contact/${data.id}`);
  assert.deepEqual(marked, [data.id, "notification-id"]);
});

test("exhausted email budget does not call the mail provider or mark the record as sent", async () => {
  const { store } = fixture();
  store.consumeLimit = async () => false;
  store.markNotified = async () => {
    assert.fail("must stay pending");
  };
  assert.equal(
    await notifyContact(
      { ...fields(), id: randomUUID() },
      config,
      store,
      async () => {
        assert.fail("must not send");
      },
    ),
    false,
  );
});
