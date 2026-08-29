# API Excellence Awards 2026 — nominations

A single-page Next.js nomination experience for the Association of Publishers in India (API) Excellence Awards, Founders Edition.

Live at <https://api-excellence-awards.vercel.app>.

## Included

- Responsive public information page with the approved API logo
- Prominent nomination status and 10 September 2026 closing date
- Branded browser, home-screen and social-sharing images
- Canonical metadata, manifest, sitemap, robots rules and a custom not-found page
- Five award categories and a focused four-step nomination form
- Revised 300/150/150-word nomination sections
- Required eligibility, good-faith, publicity and terms declarations
- Optional single URL or private supporting-file upload
- Server-side validation and server-only Supabase writes
- Branded nominee confirmation email through Gmail SMTP after a successful database submission
- Awards-staff alert on every nomination, carrying the running nomination number
- Daily 11am register emailed to staff as a formatted Excel workbook
- Daily pipeline health check that writes and rolls back, storing and emailing nothing
- Static-credential admin desk at `/admin/nominations`
- Authenticated supporting-file downloads and CSV export

## Local setup

1. Install dependencies with `npm install`.
2. Add the required values to a local `.env.local`: Supabase URL, service-role key, site URL,
   static admin credentials, admin session secret, the Gmail app password, the admin
   notification list and a cron secret. `.env.example` lists every name.
3. Apply the SQL files in `supabase/migrations` in filename order.
4. Start the app with `npm run dev`.

`NEXT_PUBLIC_SITE_URL` sets the canonical metadata base, the sitemap host and the robots host.
When it is missing, a production build falls back to <https://api-excellence-awards.vercel.app> and
a development build to `http://localhost:3000`.

The public form posts multipart data to `/api/nominations`. Nomination rows and supporting files are written only by the server with the service-role key. The supporting-material bucket is private, limited to 4 MB, and accepts PDF, Word, JPG and PNG files.

## Admin desk

Open `/admin/nominations` and sign in with the configured static username and password. Authorised staff can:

- search and review all revised nomination fields;
- open submitted supporting URLs;
- download private supporting files;
- export the register as an Excel-compatible UTF-8 CSV.

## Confirmation email setup

Nominee confirmations are sent through Gmail SMTP from `apiexcellenceawards2026@gmail.com`. Google
relays the message itself, so SPF and DKIM both align with `gmail.com` and the mail authenticates
properly. No third-party sending service can do that for a Gmail address — `gmail.com` publishes
`v=spf1 redirect=_spf.google.com`, which authorises only Google's own servers — which is why mail
sent as this address through an external provider tends to be filtered as spam.

Add these server-only environment variables locally and in Vercel:

- `GMAIL_USER` (optional; defaults to the address above)
- `GMAIL_APP_PASSWORD` — a 16-character Google app password

### Creating the app password

1. Sign in to the `apiexcellenceawards2026@gmail.com` Google Account.
2. Turn on **Security -> 2-Step Verification**. App passwords are unavailable without it.
3. Open **Security -> 2-Step Verification -> App passwords**, create one for Mail, and copy the
   16-character value.
4. Store it as `GMAIL_APP_PASSWORD`. Google shows it in four spaced blocks; the app strips
   whitespace, so either form works.

An app password grants full send access to the mailbox and bypasses 2-Step Verification. Keep it
server-only and revoke it from the same screen if it is ever exposed.

### Limits and behaviour

A free Gmail account allows roughly 500 recipients a day, far above expected nomination volume. If
that cap is reached the send fails with the `rate_limited` reason and the nomination itself is still
saved. Messages sent this way are copied to the mailbox's own Sent folder, so the awards team keeps
a record without needing a separate notification email.

Delivery runs over SMTP on port 465 and so requires the Node.js runtime, which
`app/api/nominations/route.ts` already declares. Connection, greeting and socket timeouts are set so
a stalled SMTP session cannot hold the serverless function open until it times out.

After adding or changing Vercel environment variables, create a new production deployment; existing
deployments do not receive updated environment values.

If Gmail is unavailable, the nomination remains saved in Supabase and the success screen tells the
submitter to retain their submission reference and check their spam folder.

## Admin notifications and the daily register

`ADMIN_NOTIFICATION_EMAILS` is a comma-separated, server-only list of the awards staff. They receive:

- **Every new nomination.** Once a nomination is saved, staff get a summary carrying the running
  nomination number, the submission reference and the nominee's details. The submitter's own
  confirmation is sent at the same time; either message can fail without affecting the other, and
  neither failure affects the saved nomination.
- **The 11am register.** A spreadsheet of the whole register, attached as `.xlsx`. A Summary sheet
  carries the total, the last 24 hours and counts by category and by status. A Nominations sheet
  carries all 40 stored fields per entry: identification and status, the nominee, who submitted and
  how to reach them, the three written sections, supporting URL and file metadata, all ten
  declarations, and the internal review columns. Timestamps are rendered in IST, categories and
  nomination types in their readable form, and the reference column stays pinned while scrolling.
  Numbering matches what the per-nomination alert quoted, so the oldest entry is number 1.

  The admin CSV download at `/admin/nominations` shares the same field list and formatting, so the
  two exports can never disagree.
- **Health check failures**, and nothing else from the check. See below.

## Scheduled jobs

`vercel.json` registers two Vercel Cron jobs. Vercel schedules in UTC, so each time is IST minus
5 hours 30 minutes:

| Job | Route | IST | UTC cron |
| --- | --- | --- | --- |
| Health check | `/api/cron/health-check` | 10:30 | `0 5 * * *` |
| Daily register | `/api/cron/daily-report` | 11:00 | `30 5 * * *` |

Both routes demand `Authorization: Bearer $CRON_SECRET`, compared in constant time. Vercel sends
that header automatically once `CRON_SECRET` exists in the project environment; while the variable
is missing the routes reject every request, including Vercel's own. Trigger either by hand with:

```
curl -H "Authorization: Bearer $CRON_SECRET"   https://api-excellence-awards.vercel.app/api/cron/daily-report
```

The Hobby plan allows exactly two cron jobs at one run per day, which is precisely what this uses,
and it may run them up to an hour late. If 11am has to be exact, or a third job is ever needed, move
the triggers to an external scheduler and keep the routes as they are.

## Daily health check

The check proves the nomination pipeline still works without putting anything in the register or in
the staff inboxes. It runs three stages:

1. **Validation** — a complete sample submission is parsed by the same `nominationSchema` the public
   form uses, so a regression in the rules is caught before a real nominee meets it.
2. **Database write** — `health_check_nomination_write()` performs a genuine `INSERT` into
   `award_nominations`, exercising every column, check constraint and default, then raises a private
   error code that unwinds the surrounding plpgsql subtransaction. Postgres rolls the row back, so
   the probe is never committed.
3. **Isolation** — the register is searched for any surviving probe row. Finding one fails the check
   loudly, because it would mean the rollback had stopped working.

A passing check is deliberately silent. Only a failure emails `ADMIN_NOTIFICATION_EMAILS`, and the
probe data itself is never emailed to anyone.

Apply `supabase/migrations/20260829060000_nomination_health_check.sql` before the first run. Until
it exists the check fails at the database stage and alerts, which is the correct behaviour but not
a useful signal.

## Confirm with the client before launch

- Finalist announcement date
- Whether the awards move to a custom domain from `api-excellence-awards.vercel.app`

The ceremony date is set to 25 September 2026 from the revised client Terms and Conditions.
