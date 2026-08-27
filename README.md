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
- Nominee confirmation email through FormSubmit after a successful database submission
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

Nomination confirmations are sent through [FormSubmit](https://formsubmit.co) using the awards
mailbox `apiexcellenceawards2026@gmail.com`. FormSubmit needs no API key, so the only server-only
environment variable is optional:

- `FORMSUBMIT_TARGET` (optional; defaults to `apiexcellenceawards2026@gmail.com`). Set it to the
  random alias FormSubmit issues after activation to keep the address out of the request URL.

The app also sends the site URL as the request `Origin`. FormSubmit rejects submissions that
arrive without one. `NEXT_PUBLIC_SITE_URL` supplies it; when that variable is missing, a production
build falls back to <https://api-excellence-awards.vercel.app> and a development build to
`http://localhost:3000`. Both origins are accepted by FormSubmit.

### Activating the mailbox

FormSubmit will not deliver anything until the mailbox is activated once:

1. The first submission makes FormSubmit email an **Activate Form** link to
   `apiexcellenceawards2026@gmail.com`.
2. The mailbox owner opens that email and clicks the link.
3. FormSubmit then shows a random alias string. Store it in `FORMSUBMIT_TARGET` if you prefer not
   to expose the address.

Until the link is clicked, every submission is rejected with the `not_activated` reason and logged
by `/api/nominations`.

### How each email is delivered

FormSubmit always delivers to the activated mailbox and renders its own table template, so the
nomination lands in the awards inbox and the person who submitted it receives a copy through `_cc`.
FormSubmit does not accept a custom HTML body, so the previously branded confirmation layout is not
available; the message is FormSubmit's template built from the submitted fields. FormSubmit's
`_autoresponse` feature is deliberately unused because it does not work for AJAX submissions or
when reCAPTCHA is disabled, both of which apply to server-side calls.

After adding or changing Vercel environment variables, create a new production deployment; existing
deployments do not receive updated environment values.

If FormSubmit is unavailable, the nomination remains saved in Supabase and the success screen tells
the submitter to retain their submission reference.

## Confirm with the client before launch

- Finalist announcement date
- Whether the awards move to a custom domain from `api-excellence-awards.vercel.app`

The ceremony date is set to 25 September 2026 from the revised client Terms and Conditions.
