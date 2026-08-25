# API Excellence Awards 2026 — nominations

A single-page Next.js nomination experience for the Association of Publishers in India (API) Excellence Awards & Summit, Founders Edition.

## Included

- Premium responsive public information page with the approved API logo
- Five award categories and a focused four-step nomination form
- Revised 300/150/150-word nomination sections
- Required eligibility, good-faith, publicity and terms declarations
- Optional single URL or private supporting-file upload
- Server-side validation and server-only Supabase writes
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

## Confirm with the client before launch

- Nomination submission deadline
- Finalist announcement date
- Final production domain

The ceremony date is set to 25 September 2026 from the revised client Terms and Conditions.
