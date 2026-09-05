-- WesleyLink sample circuit data for local development.
-- Run after 0001_wesleylink_foundation.sql.
do $$
declare
  circuit uuid;
  church uuid;
  point uuid;
begin
  insert into public.circuits (name, code) values ('Goromonzi Circuit', 'GOR-001') returning id into circuit;
  insert into public.churches (circuit_id, name, code, address) values
    (circuit, 'UMC Goromonzi Church', 'GOR-CH-01', 'Goromonzi, Zimbabwe') returning id into church;
  insert into public.preaching_points (church_id, name) values (church, 'Acturus Preaching Point') returning id into point;
  insert into public.sections (church_id, preaching_point_id, name, description) values
    (church, null, 'Goromonzi Central', 'Families meeting for small services in the central area'),
    (church, point, 'Acturus Section', 'Families connected to Acturus Preaching Point'),
    (church, null, 'Rusike Section', 'Families meeting in the Rusike area');
  insert into public.reporting_periods (circuit_id, label, starts_on, ends_on, opening_membership, closing_membership)
    values (circuit, '2025/26', '2025-07-01', '2026-06-30', 300, 320);
end $$;
