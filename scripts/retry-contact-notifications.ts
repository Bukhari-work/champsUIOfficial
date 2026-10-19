import { contactConfig, notifyContact } from "../src/server/contact.ts";
import { createContactStore } from "../src/server/contactStore.ts";

// Operator-only command; never exposed as an unauthenticated website endpoint.
const config = contactConfig(process.env);
if (!config)
  throw new Error(
    "Set the contact backend environment variables in .env first.",
  );
const store = createContactStore(config.databaseUrl);
await store.cleanupLimits();
const pending = await store.pending(25);
let sent = 0;
for (const message of pending) {
  try {
    if (!(await notifyContact(message, config, store))) {
      console.log(
        "Daily notification budget reached. Remaining messages stay pending.",
      );
      break;
    }
    sent += 1;
  } catch {
    console.error("Notification remains pending:", message.id);
  }
  // Keep below the provider's API request rate limit.
  await new Promise((resolve) => setTimeout(resolve, 600));
}
console.log(
  `Sent ${sent} notification(s); processed at most ${pending.length} pending message(s).`,
);
