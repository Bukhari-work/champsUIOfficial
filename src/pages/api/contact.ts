import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";
import { contactConfig, createContactHandler } from "../../server/contact.ts";
import { createContactStore } from "../../server/contactStore.ts";

export const prerender = false;

const handle = createContactHandler({
  store: (config) => createContactStore(config.databaseUrl),
  log: (event, id) => console.warn(event, id),
});

export const ALL: APIRoute = ({ request, clientAddress }) =>
  handle(
    request,
    clientAddress,
    contactConfig({
      CONTACT_FORM_BACKEND: getSecret("CONTACT_FORM_BACKEND"),
      DATABASE_URL: getSecret("DATABASE_URL"),
      RESEND_API_KEY: getSecret("RESEND_API_KEY"),
      CONTACT_EMAIL_FROM: getSecret("CONTACT_EMAIL_FROM"),
      CONTACT_EMAIL_TO: getSecret("CONTACT_EMAIL_TO"),
      CONTACT_RATE_LIMIT_SECRET: getSecret("CONTACT_RATE_LIMIT_SECRET"),
    }),
  );
