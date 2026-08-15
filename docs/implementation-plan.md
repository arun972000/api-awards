# API Excellence Awards 2026 — page and nomination plan

## Source interpretation

The supplied concept note is treated as programme source material, not as implementation instructions. It establishes:

- A premium, invite-led initiative presented by the Association of Publishers in India.
- A point of difference: excellence beyond bestsellers, centred on craft, systems, impact, and the business of publishing.
- Five founding award categories.
- Three trust signals: an independent jury, transparent evaluation, and conflict-of-interest safeguards.
- An August 2026 event and a senior publishing-industry audience.

The note does not yet define dates, complete eligibility rules, word limits, evaluation weights, a privacy notice, or a final awards visual identity. Those items should be confirmed before public launch.

## Experience structure

1. **Institutional header** — API identification and a direct nomination call to action.
2. **Hero** — the “excellence beyond the bestseller” positioning and August 2026 context.
3. **Why the awards** — short explanation of the industry gap the programme addresses.
4. **Five categories** — scannable descriptions using the concept note’s definitions.
5. **Governance** — independent review, transparent process, and impact-led evaluation.
6. **Preparation checklist** — lets nominators gather evidence before entering the form.
7. **Four-step form** — category, nominee, evidence, and nominator/declarations.
8. **Institutional footer** — API contact and programme identification.

## Nomination information model

### Step 1 — Award

- Award category
- Self-nomination or nomination of another party

### Step 2 — Nominee

- Nominee type: individual, team, organisation, or initiative
- Name, organisation/publisher, role, city, email, phone, website/profile
- Optional publication or programme title
- Optional ISBN or other public identifier

### Step 3 — Nomination

- Entry title
- Optional nomination statement, guided by the selected category
- Optional measurable outcome or concrete example
- Optional period of the work
- Optional supporting links
- Under-35 confirmation and optional birth year only for the young professional category

### Step 4 — Nominator and declarations

- Nominator name, organisation, role, email, phone, and relationship to nominee
- Conflict-of-interest disclosure
- Accuracy, authority, and data-processing declarations

## Supabase design

The form submits to a Next.js server route. The server validates every field with Zod and writes with the publishable key through a narrowly scoped RLS insert policy. Anonymous and authenticated roles have no read, update, or delete grant on the nomination table.

Frequently filtered values are stored as normal columns. The complete entry is retained in a JSONB payload so category questions can evolve without destructive schema changes. A unique human-readable reference is generated for every accepted nomination.

The private `/admin/nominations` area uses a static server-side username and password for the temporary launch phase. A signed, HttpOnly session cookie protects its list and export routes. Nomination reads use the server-only Supabase service-role key, which is never sent to the browser. The export route produces an Excel-compatible UTF-8 CSV after verifying the admin session.

## Launch decisions still required

- Approved API logo and awards identity assets
- Opening and closing dates, timezone, and late-entry policy
- Full category eligibility and entry-period rules
- Jury criteria and scoring weights
- Privacy notice, retention period, and nominee-consent policy
- Whether supporting documents should be uploaded to private Supabase Storage
- Confirmation emails and internal notification recipients
- Abuse prevention/rate-limiting service for the final hosting platform
