-- Nomination contact details must only be read through trusted server code.
-- Keep the tightly constrained anonymous INSERT policy used by the public form.

revoke select, update, delete, truncate, references, trigger
  on table public.award_nominations
  from anon, authenticated;

grant insert on table public.award_nominations to anon;

comment on table public.award_nominations is
  'Private API Excellence Awards nominations. Public visitors may submit through the validated form but cannot read or modify entries.';
