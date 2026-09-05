-- Council approval publishes an approved committee plan to the official calendar.
create or replace function public.approve_committee_submission(submission_id uuid, decision public.submission_status, comments text default null)
returns public.committee_submissions language plpgsql security definer set search_path = public as $$
declare result public.committee_submissions; circuit uuid; church uuid; start_date date;
begin
  select c.circuit_id, c.id, s.proposed_start into circuit, church, start_date from public.committee_submissions s join public.committees x on x.id=s.committee_id join public.churches c on c.id=x.church_id where s.id=submission_id;
  if circuit is null or not public.has_circuit_role(circuit, array['super_admin','circuit_admin','church_admin','pastor','council_member']::public.app_role[]) then raise exception 'Council approval permission required'; end if;
  update public.committee_submissions set status=decision, reviewed_by=auth.uid(), reviewed_at=now(), review_comments=comments, approved_at=case when decision='approved' then now() else approved_at end, updated_at=now() where id=submission_id returning * into result;
  if decision='approved' and start_date is not null and not exists (select 1 from public.calendar_events where committee_submission_id=submission_id) then
    insert into public.calendar_events (circuit_id, church_id, committee_submission_id, title, description, starts_at, status, council_approved_at, council_approved_by, created_by)
    values (circuit, church, submission_id, result.title, result.objective, start_date::timestamptz, 'published', now(), auth.uid(), auth.uid());
  end if;
  return result;
end; $$;
