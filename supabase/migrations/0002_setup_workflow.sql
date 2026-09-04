-- First-run setup helpers. These keep multi-table setup atomic and auditable.
create or replace function public.create_church_structure(
  target_circuit uuid,
  church_name text,
  church_code text default null,
  preaching_point_names jsonb default '[]'::jsonb,
  section_names jsonb default '[]'::jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  church_id uuid;
  point_id uuid;
  item text;
begin
  if not public.has_circuit_role(target_circuit, array['super_admin','circuit_admin']::public.app_role[]) then
    raise exception 'Circuit administrator permission required';
  end if;
  insert into public.churches (circuit_id, name, code) values (target_circuit, trim(church_name), nullif(trim(church_code),'')) returning id into church_id;
  for item in select jsonb_array_elements_text(coalesce(preaching_point_names,'[]'::jsonb)) loop
    insert into public.preaching_points (church_id, name) values (church_id, trim(item)) returning id into point_id;
  end loop;
  for item in select jsonb_array_elements_text(coalesce(section_names,'[]'::jsonb)) loop
    insert into public.sections (church_id, name) values (church_id, trim(item));
  end loop;
  return church_id;
end; $$;
revoke all on function public.create_church_structure(uuid,text,text,jsonb,jsonb) from public;
grant execute on function public.create_church_structure(uuid,text,text,jsonb,jsonb) to authenticated;
