-- Separate platform root administration from circuit-level administration.
create type public.platform_role as enum ('root_admin');
create table public.platform_memberships (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role public.platform_role not null default 'root_admin',
  created_at timestamptz not null default now()
);
alter table public.platform_memberships enable row level security;
create policy "root users view root membership" on public.platform_memberships for select using (user_id = auth.uid());

create or replace function public.is_platform_root() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.platform_memberships where user_id = auth.uid() and role = 'root_admin');
$$;

-- Safe first-run claim: only the first authenticated account can claim root.
create or replace function public.claim_first_root() returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if exists (select 1 from public.platform_memberships) then raise exception 'A platform root already exists'; end if;
  insert into public.platform_memberships (user_id) values (auth.uid());
  return true;
end; $$;
revoke all on function public.claim_first_root() from public;
grant execute on function public.claim_first_root() to authenticated;

-- Root creates a circuit; circuit admins manage what is inside it.
create or replace function public.create_first_circuit(circuit_name text, circuit_code text default null)
returns public.circuits language plpgsql security definer set search_path = public as $$
declare created public.circuits;
begin
  if not public.is_platform_root() then raise exception 'Platform root permission required'; end if;
  insert into public.circuits (name, code) values (trim(circuit_name), nullif(trim(circuit_code),'')) returning * into created;
  insert into public.circuit_memberships (circuit_id, user_id, role) values (created.id, auth.uid(), 'circuit_admin');
  return created;
end; $$;
revoke all on function public.create_first_circuit(text,text) from public;
grant execute on function public.create_first_circuit(text,text) to authenticated;
