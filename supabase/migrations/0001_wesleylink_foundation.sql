-- WesleyLink foundation schema
-- Apply this migration in Supabase SQL Editor or through Supabase CLI.
create extension if not exists pgcrypto;

create type public.app_role as enum ('super_admin','circuit_admin','pastor','church_admin','council_member','committee_chair','committee_member','treasurer','financial_secretary','statistician','section_leader','viewer');
create type public.member_status as enum ('active','inactive','transferred_out','deceased','withdrawn','removed_by_charge','untraceable');
create type public.membership_category as enum ('full_member','adult_probationer','child_under_12','affiliate','associate');
create type public.membership_event_type as enum ('baptism','confirmation','reaffirmation','transfer_in','transfer_out','death','withdrawal','removal_by_charge','category_change');
create type public.submission_status as enum ('draft','submitted','under_review','changes_requested','approved','rejected','published','completed');
create type public.currency_code as enum ('USD','ZWL');

create table public.circuits (
  id uuid primary key default gen_random_uuid(), name text not null, code text unique,
  reporting_start_month smallint not null default 7 check (reporting_start_month between 1 and 12),
  reporting_start_day smallint not null default 1 check (reporting_start_day between 1 and 28),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', email text, avatar_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.circuit_memberships (
  id uuid primary key default gen_random_uuid(), circuit_id uuid not null references public.circuits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, role public.app_role not null,
  created_at timestamptz not null default now(), unique(circuit_id,user_id,role)
);
create table public.churches (
  id uuid primary key default gen_random_uuid(), circuit_id uuid not null references public.circuits(id) on delete cascade,
  name text not null, code text, address text, active boolean not null default true, created_at timestamptz not null default now(), unique(circuit_id,name)
);
create table public.preaching_points (
  id uuid primary key default gen_random_uuid(), church_id uuid not null references public.churches(id) on delete cascade,
  name text not null, active boolean not null default true, created_at timestamptz not null default now(), unique(church_id,name)
);
create table public.sections (
  id uuid primary key default gen_random_uuid(), church_id uuid not null references public.churches(id) on delete cascade,
  preaching_point_id uuid references public.preaching_points(id) on delete set null,
  name text not null, description text, active boolean not null default true, created_at timestamptz not null default now(), unique(church_id,name)
);
create table public.members (
  id uuid primary key default gen_random_uuid(), circuit_id uuid not null references public.circuits(id) on delete restrict,
  church_id uuid not null references public.churches(id) on delete restrict, preaching_point_id uuid references public.preaching_points(id) on delete set null,
  section_id uuid references public.sections(id) on delete set null, first_name text not null, middle_name text, last_name text not null,
  gender text not null check (gender in ('male','female')), date_of_birth date, category public.membership_category not null,
  status public.member_status not null default 'active', phone text, email text, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index members_circuit_status_idx on public.members(circuit_id,status);
create index members_section_idx on public.members(section_id);
create table public.membership_events (
  id uuid primary key default gen_random_uuid(), member_id uuid not null references public.members(id) on delete restrict,
  event_type public.membership_event_type not null, event_date date not null, reporting_year_start date not null,
  details jsonb not null default '{}', source_reference text, created_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create index membership_events_period_idx on public.membership_events(reporting_year_start,event_date,event_type);
create table public.reporting_periods (
  id uuid primary key default gen_random_uuid(), circuit_id uuid not null references public.circuits(id) on delete cascade,
  label text not null, starts_on date not null, ends_on date not null, status public.submission_status not null default 'draft',
  opening_membership integer, closing_membership integer, locked_at timestamptz, created_at timestamptz not null default now(), unique(circuit_id,starts_on)
);
create table public.committees (
  id uuid primary key default gen_random_uuid(), church_id uuid not null references public.churches(id) on delete cascade, name text not null, description text, active boolean not null default true, unique(church_id,name)
);
create table public.committee_submissions (
  id uuid primary key default gen_random_uuid(), committee_id uuid not null references public.committees(id) on delete restrict,
  reporting_period_id uuid references public.reporting_periods(id) on delete set null, title text not null, objective text, plan_of_action text,
  expected_impact text, expected_outcome text, proposed_start date, proposed_end date, location text, budget numeric(14,2), currency public.currency_code,
  status public.submission_status not null default 'draft', submitted_by uuid references public.profiles(id), approved_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(), circuit_id uuid not null references public.circuits(id) on delete cascade, church_id uuid references public.churches(id) on delete set null,
  committee_submission_id uuid references public.committee_submissions(id) on delete set null, title text not null, description text, starts_at timestamptz not null, ends_at timestamptz,
  location text, status public.submission_status not null default 'draft', council_approved_at timestamptz, council_approved_by uuid references public.profiles(id), created_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.finance_transactions (
  id uuid primary key default gen_random_uuid(), circuit_id uuid not null references public.circuits(id) on delete cascade, church_id uuid references public.churches(id) on delete set null,
  transaction_date date not null, transaction_type text not null check (transaction_type in ('income','expense')), category text not null, description text,
  amount numeric(14,2) not null check (amount >= 0), currency public.currency_code not null, approved_at timestamptz, approved_by uuid references public.profiles(id), created_by uuid references public.profiles(id), created_at timestamptz not null default now()
);

-- Helper functions used by RLS. Users only see circuits they belong to.
create or replace function public.is_circuit_member(target_circuit uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.circuit_memberships where circuit_id = target_circuit and user_id = auth.uid());
$$;
create or replace function public.has_circuit_role(target_circuit uuid, allowed public.app_role[]) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.circuit_memberships where circuit_id = target_circuit and user_id = auth.uid() and role = any(allowed));
$$;

alter table public.circuits enable row level security;
alter table public.profiles enable row level security;
alter table public.circuit_memberships enable row level security;
alter table public.churches enable row level security;
alter table public.preaching_points enable row level security;
alter table public.sections enable row level security;
alter table public.members enable row level security;
alter table public.membership_events enable row level security;
alter table public.reporting_periods enable row level security;
alter table public.committees enable row level security;
alter table public.committee_submissions enable row level security;
alter table public.calendar_events enable row level security;
alter table public.finance_transactions enable row level security;

create policy "members can view circuits" on public.circuits for select using (public.is_circuit_member(id));
create policy "users view own profile" on public.profiles for select using (id = auth.uid());
create policy "members view memberships" on public.circuit_memberships for select using (public.is_circuit_member(circuit_id));
create policy "circuit members read churches" on public.churches for select using (public.is_circuit_member(circuit_id));
create policy "circuit members read preaching points" on public.preaching_points for select using (exists (select 1 from public.churches c where c.id=church_id and public.is_circuit_member(c.circuit_id)));
create policy "circuit members read sections" on public.sections for select using (exists (select 1 from public.churches c where c.id=church_id and public.is_circuit_member(c.circuit_id)));
create policy "circuit members read members" on public.members for select using (public.is_circuit_member(circuit_id));
create policy "authorized users manage members" on public.members for all using (public.has_circuit_role(circuit_id, array['super_admin','circuit_admin','church_admin','pastor','statistician']::public.app_role[])) with check (public.is_circuit_member(circuit_id));
create policy "circuit members read events" on public.membership_events for select using (exists (select 1 from public.members m where m.id=member_id and public.is_circuit_member(m.circuit_id)));
create policy "circuit members read periods" on public.reporting_periods for select using (public.is_circuit_member(circuit_id));
create policy "circuit members read committees" on public.committees for select using (exists (select 1 from public.churches c where c.id=church_id and public.is_circuit_member(c.circuit_id)));
create policy "circuit members read submissions" on public.committee_submissions for select using (exists (select 1 from public.committees x join public.churches c on c.id=x.church_id where x.id=committee_id and public.is_circuit_member(c.circuit_id)));
create policy "circuit members read calendar" on public.calendar_events for select using (public.is_circuit_member(circuit_id));
create policy "authorized finance users read finance" on public.finance_transactions for select using (public.has_circuit_role(circuit_id, array['super_admin','circuit_admin','pastor','church_admin','treasurer','financial_secretary','statistician']::public.app_role[]));
create policy "authorized finance users manage finance" on public.finance_transactions for all using (public.has_circuit_role(circuit_id, array['super_admin','circuit_admin','pastor','church_admin','treasurer','financial_secretary']::public.app_role[])) with check (public.is_circuit_member(circuit_id));

-- Create a profile automatically for each authenticated user.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Secure first-run bootstrap: the authenticated user becomes the circuit's Super Admin.
create or replace function public.create_first_circuit(circuit_name text, circuit_code text default null)
returns public.circuits language plpgsql security definer set search_path = public as $$
declare created public.circuits;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if exists (select 1 from public.circuit_memberships where user_id = auth.uid() and role = 'super_admin') then raise exception 'Super Admin already has a circuit'; end if;
  insert into public.circuits (name, code) values (trim(circuit_name), nullif(trim(circuit_code),'')) returning * into created;
  insert into public.circuit_memberships (circuit_id, user_id, role) values (created.id, auth.uid(), 'super_admin');
  return created;
end; $$;
revoke all on function public.create_first_circuit(text,text) from public;
grant execute on function public.create_first_circuit(text,text) to authenticated;

-- Realtime publication for workflow and calendar updates.
alter publication supabase_realtime add table public.committee_submissions;
alter publication supabase_realtime add table public.calendar_events;
alter publication supabase_realtime add table public.reporting_periods;
