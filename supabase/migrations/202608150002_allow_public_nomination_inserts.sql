-- Allow anonymous visitors to create, but never read or modify, nominations.
-- The policy mirrors the columns written by the validated Next.js API route.

grant usage on schema public to anon;
grant insert on table public.award_nominations to anon;

create policy "allow_valid_nomination_inserts"
  on public.award_nominations
  for insert
  to anon
  with check (
    status = 'submitted'
    and internal_notes is null
    and reviewed_by is null
    and reviewed_at is null
    and submission_reference ~ '^API26-[A-F0-9]{8}$'
    and jsonb_typeof(payload) = 'object'
    and category = payload ->> 'category'
    and nomination_type = payload ->> 'nominationType'
    and nominee_name = payload ->> 'nomineeName'
    and nominee_organisation = payload ->> 'nomineeOrganisation'
    and nominee_email = payload ->> 'nomineeEmail'
    and nominator_name = payload ->> 'nominatorName'
    and nominator_email = payload ->> 'nominatorEmail'
    and entry_title = payload ->> 'entryTitle'
  );
