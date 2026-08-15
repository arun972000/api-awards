# API Excellence Awards 2026 — nominations

A single-page Next.js nomination experience for the Association of Publishers in India (API) Excellence Awards & Summit, Founders Edition.

## What is included

- Premium, responsive public information page based on the supplied concept note
- Five award categories and a four-step nomination form
- Category-aware evidence prompts and Under-35 eligibility handling
- Server-side validation and private Supabase writes
- SQL migration with RLS enabled and no public table access
- CSV export script for authorised administrators

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local `.env.local` file and add the required Supabase URL, publishable key, service-role key, site URL, and static admin credentials. Keep this file local and never commit it.

3. Run both SQL files in `supabase/migrations` in filename order. The first creates the private nominations table; the second grants insert-only access through a strict RLS policy.

4. Start the app:

   ```bash
   npm run dev
   ```

The form posts to `/api/nominations`. The publishable key can only insert rows that satisfy the migration's strict RLS policy; it cannot read, update, or delete nominations.

## Export nominations

Add `SUPABASE_SERVICE_ROLE_KEY` to the trusted administrator environment, then run:

```bash
npm run export:nominations
```

The script writes an Excel-compatible UTF-8 CSV into `./exports` by default. Set `EXPORT_DIRECTORY` to change the output folder.

## Production checklist

- Replace the typographic API mark with the approved high-resolution brand asset.
- Confirm nomination dates, final eligibility rules, privacy language, and evaluation criteria with API.
- Configure the production Supabase project and keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Add rate limiting and transactional confirmation emails before a high-traffic launch.
- Set the final production domain in `NEXT_PUBLIC_SITE_URL`.
