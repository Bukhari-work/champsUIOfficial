-- Run in Neon's SQL Editor on each environment's database before activation.
-- Re-running this initial migration is safe; it does not delete existing data.
BEGIN;

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 10000),
  language text NOT NULL CHECK (language IN ('en', 'id')),
  created_at timestamptz NOT NULL DEFAULT now(),
  notification_status text NOT NULL DEFAULT 'pending'
    CHECK (notification_status IN ('pending', 'sent')),
  notification_sent_at timestamptz,
  notification_id text
);

CREATE INDEX IF NOT EXISTS contact_messages_pending
  ON contact_messages (created_at) WHERE notification_status = 'pending';

CREATE TABLE IF NOT EXISTS contact_rate_limits (
  key text PRIMARY KEY,
  attempts integer NOT NULL CHECK (attempts > 0),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS contact_rate_limits_expiry
  ON contact_rate_limits (expires_at);

COMMIT;
