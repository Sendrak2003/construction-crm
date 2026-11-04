drop policy profiles_select on public.profiles;

create policy profiles_select on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or public.is_manager()
  or exists (
    select 1 from public.tasks t
    where t.assignee_id = auth.uid() and t.author_id = profiles.id
  )
  or exists (
    select 1
    from public.task_history h
    join public.tasks t on t.id = h.task_id
    where h.changed_by = profiles.id and t.assignee_id = auth.uid()
  )
);
