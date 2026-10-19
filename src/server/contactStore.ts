import { neon } from "@neondatabase/serverless";
import type { ContactMessage, ContactStore } from "./contact.ts";

export function createContactStore(databaseUrl: string): ContactStore {
  const sql = neon(databaseUrl);
  const query = (text: string, values: unknown[] = []) =>
    sql.query(text, values, {
      fetchOptions: { signal: AbortSignal.timeout(8000) },
    });
  return {
    async find(id) {
      const rows = await query(
        "SELECT id, name, email, message, language FROM contact_messages WHERE id = $1",
        [id],
      );
      return rows[0] as ContactMessage | undefined;
    },
    async save(message) {
      const rows = await query(
        `
        INSERT INTO contact_messages (id, name, email, message, language)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING RETURNING id`,
        [
          message.id,
          message.name,
          message.email,
          message.message,
          message.language,
        ],
      );
      return rows.length > 0;
    },
    async consumeLimit(key, limit, expiresAt) {
      const rows = await query(
        `
        WITH expired AS (DELETE FROM contact_rate_limits WHERE expires_at < now())
        INSERT INTO contact_rate_limits (key, attempts, expires_at)
        VALUES ($1, 1, $2)
        ON CONFLICT (key) DO UPDATE SET attempts = contact_rate_limits.attempts + 1
        WHERE contact_rate_limits.attempts < $3 RETURNING attempts`,
        [key, expiresAt.toISOString(), limit],
      );
      return rows.length > 0;
    },
    async markNotified(id, notificationId) {
      await query(
        "UPDATE contact_messages SET notification_status = 'sent', notification_sent_at = now(), notification_id = $1 WHERE id = $2",
        [notificationId, id],
      );
    },
    async pending(limit) {
      return (await query(
        "SELECT id, name, email, message, language FROM contact_messages WHERE notification_status = 'pending' ORDER BY created_at LIMIT $1",
        [limit],
      )) as ContactMessage[];
    },
    async cleanupLimits() {
      await query("DELETE FROM contact_rate_limits WHERE expires_at < now()");
    },
  };
}
