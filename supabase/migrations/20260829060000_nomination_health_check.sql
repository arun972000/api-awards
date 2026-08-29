-- Daily health probe for the nomination write path.
--
-- The function performs a genuine INSERT into award_nominations so that column
-- constraints, checks and defaults are all exercised, then raises a private
-- error code to unwind the plpgsql subtransaction. Postgres rolls the insert
-- back, so the probe never commits a row and the register stays clean.

create or replace function public.health_check_nomination_write()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  -- gen_random_uuid() is core in Postgres 13+, so it resolves from pg_catalog
  -- under the restricted search_path below. pgcrypto's gen_random_bytes() does
  -- not: Supabase installs that extension into the extensions schema.
  probe_reference text :=
    'API26-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
  written integer;
begin
  begin
    insert into public.award_nominations (
      submission_reference,
      category,
      nomination_type,
      nominee_name,
      nominee_organisation,
      nominee_email,
      nominator_name,
      nominator_email,
      entry_title,
      payload
    ) values (
      probe_reference,
      'publishing_innovation',
      'self',
      'Automated health check',
      'Automated health check',
      'healthcheck@example.invalid',
      'Automated health check',
      'healthcheck@example.invalid',
      'Automated health check probe',
      jsonb_build_object('healthCheck', true)
    );

    get diagnostics written = row_count;

    if written <> 1 then
      raise exception 'health check insert affected % rows', written;
    end if;

    -- Private code, caught immediately below: the only purpose is to make the
    -- surrounding subtransaction roll the probe row back.
    raise exception using errcode = 'HC001', message = 'health_check_rollback';
  exception
    when sqlstate 'HC001' then
      return jsonb_build_object(
        'ok', true,
        'probeReference', probe_reference,
        'checkedAt', now()
      );
  end;
end;
$$;

comment on function public.health_check_nomination_write() is
  'Writes and rolls back one nomination row to prove the register is accepting inserts. Commits nothing.';

-- Only trusted server code may run the probe.
revoke all on function public.health_check_nomination_write() from public;
revoke all on function public.health_check_nomination_write() from anon, authenticated;
grant execute on function public.health_check_nomination_write() to service_role;
