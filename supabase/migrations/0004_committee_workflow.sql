-- Committee plans and council decisions.
alter table public.committee_submissions add column if not exists reviewed_by uuid references public.profiles(id);
alter table public.committee_submissions add column if not exists reviewed_at timestamptz;
alter table public.committee_submissions add column if not exists review_comments text;

create policy "circuit members create committee plans" on public.committee_submissions for insert with check (
  exists (select 1 from public.committees x join public.churches c on c.id=x.church_id where x.id=committee_id and public.is_circuit_member(c.circuit_id))
);
create policy "authorized users update committee plans" on public.committee_submissions for update using (
  exists (select 1 from public.committees x join public.churches c on c.id=x.church_id where x.id=committee_id and public.has_circuit_role(c.circuit_id, array['super_admin','circuit_admin','church_admin','pastor','council_member','committee_chair']::public.app_role[]))
);
create policy "authorized users create committees" on public.committees for insert with check (
  exists (select 1 from public.churches c where c.id=church_id and public.has_circuit_role(c.circuit_id, array['super_admin','circuit_admin','church_admin','pastor']::public.app_role[]))
);

create or replace function public.approve_committee_submission(submission_id uuid, decision public.submission_status, comments text default null)
returns public.committee_submissions language plpgsql security definer set search_path = public as $$
declare result public.committee_submissions; circuit uuid;
begin
  select c.circuit_id into circuit from public.committee_submissions s join public.committees x on x.id=s.committee_id join public.churches c on c.id=x.church_id where s.id=submission_id;
  if circuit is null or not public.has_circuit_role(circuit, array['super_admin','circuit_admin','church_admin','pastor','council_member']::public.app_role[]) then raise exception 'Council approval permission required'; end if;
  update public.committee_submissions set status=decision, reviewed_by=auth.uid(), reviewed_at=now(), review_comments=comments, approved_at=case when decision='approved' then now() else approved_at end, updated_at=now() where id=submission_id returning * into result;
  return result;
end; $$;
revoke all on function public.approve_committee_submission(uuid,public.submission_status,text) from public;
grant execute on function public.approve_committee_submission(uuid,public.submission_status,text) to authenticated;
