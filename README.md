# API Excellence Awards 2026 — nominations

A single-page Next.js nomination experience for the Association of Publishers in India (API) Excellence Awards, Founders Edition.

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
- Nominee confirmation email through Mailjet after a successful database submission
- Static-credential admin desk at `/admin/nominations`
- Authenticated supporting-file downloads and CSV export

## Local setup

1. Install dependencies with `npm install`.
2. Add the required values to a local `.env.local`: Supabase URL, service-role key, site URL, static admin credentials and admin session secret.
3. Apply the SQL files in `supabase/migrations` in filename order.
4. Start the app with `npm run dev`.

The public form posts multipart data to `/api/nominations`. Nomination rows and supporting files are written only by the server with the service-role key. The supporting-material bucket is private, limited to 4 MB, and accepts PDF, Word, JPG and PNG files.

## Admin desk

Open `/admin/nominations` and sign in with the configured static username and password. Authorised staff can:

- search and review all revised nomination fields;
- open submitted supporting URLs;
- download private supporting files;
- export the register as an Excel-compatible UTF-8 CSV.

## Confirmation email setup

Nominee confirmations are sent through Mailjet from
`apiexcellenceawars2026@gmail.com`. Add these server-only environment variables locally and in
Vercel:

- `MAILJET_API_KEY`
- `MAILJET_SECRET_KEY`
- `MAILJET_FROM_EMAIL` (optional; defaults to the address above)

In Mailjet, go to **My Account → Add a Sender Domain or Address**, add the Gmail address, and ask
the mailbox owner to open Mailjet's confirmation email and approve the sender using its link. The
address must show as **Active** before production messages can be delivered.

If Mailjet is unavailable, the nomination remains saved in Supabase and the success screen tells
the submitter to retain their submission reference.

## Confirm with the client before launch

- Finalist announcement date
- Final production domain

The ceremony date is set to 25 September 2026 from the revised client Terms and Conditions.
