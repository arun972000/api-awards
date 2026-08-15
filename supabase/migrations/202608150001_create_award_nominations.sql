-- API Excellence Awards 2026 nomination store
-- Run this migration in the Supabase SQL editor or with `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists public.award_nominations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submission_reference text not null unique,
  status text not null default 'submitted'
    check (status in ('submitted', 'screening', 'eligible', 'shortlisted', 'winner', 'ineligible', 'withdrawn')),
  category text not null
    check (category in (
      'publishing_innovation',
      'editorial_excellence',
      'production_sustainability',
      'social_impact',
      'young_professional'
    )),
  nomination_type text not null check (nomination_type in ('self', 'other')),
  nominee_name text not null,
  nominee_organisation text not null,
  nominee_email text not null,
  nominator_name text not null,
  nominator_email text not null,
  entry_title text not null,
  payload jsonb not null,
  internal_notes text,
  reviewed_by text,
  reviewed_at timestamptz
);

create index if not exists award_nominations_created_at_idx
  on public.award_nominations (created_at desc);

create index if not exists award_nominations_category_idx
  on public.award_nominations (category);

create index if not exists award_nominations_status_idx
  on public.award_nominations (status);

alter table public.award_nominations enable row level security;

-- There are intentionally no public policies. The Next.js server route writes with
-- the service-role key, which must never be exposed to the browser.

comment on table public.award_nominations is
  'Private nominations for the API Excellence Awards. Access via trusted server code only.';
