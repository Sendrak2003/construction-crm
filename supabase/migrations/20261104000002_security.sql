alter table public.profiles enable row level security;
alter table public.objects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_history enable row level security;

revoke all on public.profiles from public, anon, authenticated;
revoke all on public.objects from public, anon, authenticated;
revoke all on public.tasks from public, anon, authenticated;
revoke all on public.task_history from public, anon, authenticated;

grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.objects to authenticated;
grant select, delete on public.tasks to authenticated;
grant insert (title, description, object_id, assignee_id) on public.tasks to authenticated;
grant update (title, description, object_id, assignee_id) on public.tasks to authenticated;
grant select on public.task_history to authenticated;

create policy profiles_select on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or public.is_manager()
  or exists (
    select 1 from public.tasks t
    where t.assignee_id = auth.uid() and t.author_id = profiles.id
  )
);

create policy objects_select on public.objects
for select to authenticated
using (public.is_manager() or public.has_task_in_object(id));

create policy objects_insert on public.objects
for insert to authenticated
with check (public.is_manager());

create policy objects_update on public.objects
for update to authenticated
using (public.is_manager())
with check (public.is_manager());

create policy objects_delete on public.objects
for delete to authenticated
using (public.is_manager());

create policy tasks_select on public.tasks
for select to authenticated
using (public.is_manager() or assignee_id = auth.uid());

create policy tasks_insert on public.tasks
for insert to authenticated
with check (public.is_manager());

create policy tasks_update on public.tasks
for update to authenticated
using (public.is_manager())
with check (public.is_manager());

create policy tasks_delete on public.tasks
for delete to authenticated
using (public.is_manager());

create policy task_history_select on public.task_history
for select to authenticated
using (exists (select 1 from public.tasks t where t.id = task_history.task_id));

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.is_manager() to authenticated;
grant execute on function public.has_task_in_object(uuid) to authenticated;
grant execute on function public.change_task_status(uuid, public.task_status, text) to authenticated;
