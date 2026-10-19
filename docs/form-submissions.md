# Contact submissions: setup and activation

The prepared backend uses an Astro endpoint on Vercel, Neon PostgreSQL, and
Resend notifications. Production activation is a separate step after the
services are configured. Until then, `CONTACT_FORM_BACKEND=legacy` keeps the
existing Google Apps Script form flow.

## 1. Connect the database to Vercel

The owner has confirmed that the Neon database is connected to Vercel and the
initial schema has been applied. A live connection check is still pending. The
following instructions document the setup for additional environments.

Connect the existing project using
[Neon's Vercel integration](https://neon.com/docs/guides/vercel-managed-integration)
or the connectable-account integration offered in Neon. Avoid creating a second
database when Vercel asks whether to create or connect an account.

Check Vercel → project → Settings → Environment Variables for `DATABASE_URL`.
If the integration uses another name, add `DATABASE_URL` with the pooled
connection string from Neon's Connect dialog. Keep it private; it is not a
`PUBLIC_` variable. Use a separate development/preview database branch so testing
does not write into the production inquiry archive.

In Neon's SQL Editor, select the correct database and branch, paste
[`db/migrations/001_contact.sql`](../db/migrations/001_contact.sql), and run it.
This creates `contact_messages` and `contact_rate_limits`. Repeat on the test
branch. Creating the Neon project alone does not create these tables.

## 2. Verify champs.bukhari.day in Resend

The selected sending domain is **champs.bukhari.day**. Public nameservers for
`bukhari.day` are Vercel's, so its records can be managed through Vercel DNS.
Porkbun access for the website's `champs-ui.org` domain is not needed for this
sending domain.

Add **champs.bukhari.day** in Resend and follow
[Resend's Vercel DNS guide](https://resend.com/docs/guides/dns/vercel).
Resend also offers Auto Configure for Vercel DNS. When adding records manually,
open Vercel's DNS settings for `bukhari.day`. Typical relative record names are
`resend._domainkey.champs` for DKIM and `send.champs` for the return path. Copy
the exact types, names, values, and priority shown in the Resend dashboard;
record types can vary with the configuration and service infrastructure.

Public DNS checks have found a DKIM key at
`resend._domainkey.champs.bukhari.day` and a return-path alias with SPF and MX
records at `send.champs.bukhari.day`. The domain owner has confirmed that the
Resend dashboard shows **Verified**. Domain verification is complete; the private
API key, database schema, and deployment settings still need to be configured.

Configure sending only. The sender is
`CHAMPS UI Website <website@champs.bukhari.day>`, notifications are delivered to
the configured team inbox, and Reply-To uses the visitor's address. Sending does
not require a website or mailbox at `champs.bukhari.day`.

## 3. Configure private environment settings

Use [`.env.example`](../.env.example) as the local template. Set these in Vercel
on the relevant environment, with separate credentials for development/preview:

| Variable                  | Value                                                      |
| ------------------------- | ---------------------------------------------------------- |
| DATABASE_URL              | Neon pooled connection string                              |
| RESEND_API_KEY            | Resend key with sending permission for the verified domain |
| CONTACT_EMAIL_FROM        | CHAMPS UI Website <website@champs.bukhari.day>             |
| CONTACT_EMAIL_TO          | champs@ui.ac.id (use a test recipient during preview)      |
| CONTACT_RATE_LIMIT_SECRET | Random secret of at least 32 characters                    |
| CONTACT_FORM_BACKEND      | legacy until setup is ready; vercel to activate            |

Generate the rate limit secret with `openssl rand -hex 32`. Keep the database
password and Resend API key in environment settings, outside source control.
For local development, put them in the ignored `.env` file. `.env.*` is ignored
except the placeholder `.env.example`.

Resend's shared testing domain only permits sending to the account's own email
address. It can verify the code in a test environment; production notification
delivery needs an approved sending domain. Domain verification is not bypassed
by configuring an arbitrary From address.

Vercel Hobby supports functions, but its personal/non-commercial usage rules
still apply. Check eligibility before production activation, particularly if
registrations involve payments or site development is paid work.

## 4. Preview and activate

Set `CONTACT_FORM_BACKEND=vercel` on a test environment with the test branch and
recipient. Redeploy: the flag affects both the built form and runtime endpoint.
The pages stay prerendered, while `/api/contact` runs as a Vercel function. The
production build and Pagefind search index are emitted to `.vercel/output/static`.
Use `pnpm dev` locally or a Vercel Preview deployment to exercise the live API;
`astro preview` does not run the Vercel adapter's functions.

With a deliberately authorized test submission, confirm the row exists in Neon,
the notification arrives, Reply targets the submitter, and the form reports
receipt. Then apply the production schema and environment settings and redeploy.
Switching the flag back to `legacy` also requires a redeployment.

## Submission behavior and operations

- The server checks request origin, body size (64 KiB), names (120 characters),
  email addresses (254 characters), and messages (10,000 characters).
- A honeypot and persistent rate limits protect the endpoint. Limits are five
  new submissions per IP/hour, five per email/hour, and 100 total/day. IP and email
  rate keys are hashed with the private secret; raw IP addresses are not saved.
- Browser retries of the same submission reuse a UUID, preventing duplicate
  records and repeated notification sends. SQL uses bound parameters.
- A success response means the inquiry is saved. A failed database write returns
  an error, and the browser keeps the entered text.
- Notifications use the verified CHAMPS sender, the team inbox as To, and the
  visitor's address as Reply-To. One notification is sent per inquiry; there is
  no automatic email to the visitor.
- If Resend fails or the notification budget (90 attempts/day) is reached, the
  saved record stays `pending`. Email failures do not prompt visitors to submit
  the same inquiry again. Nothing automatically retries pending email yet.

Use Neon's table editor or SQL Editor to review inquiries; there is no public
inbox endpoint or admin website. For a list of inquiries:

```sql
SELECT id, created_at, name, email, message, language, notification_status
FROM contact_messages
ORDER BY created_at DESC;
```

An operator can retry up to 25 pending notifications with `pnpm contact:retry`
after configuring a local `.env`. This command **sends real email**. It also
cleans expired rate limit rows; the submission endpoint cleans them as it runs.
Run again for larger backlogs. Resend's idempotency key protects immediate email
retries for its retention window; a provider success followed by a database
failure can require checking Resend's delivery log before retrying an older row.

## Future registration forms

Add registration-specific endpoints and tables when the required fields, event
identity, capacity and duplicate rules are defined. The connection and mail
service are reusable; contact inquiries are not participant registrations.
No registration schema or account/login system is provisioned by this change.
