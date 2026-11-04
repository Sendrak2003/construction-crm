create type public.user_role as enum ('manager', 'executor');
create type public.task_status as enum ('new', 'in_progress', 'review', 'accepted', 'rework');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.user_role not null default 'executor',
  created_at timestamptz not null default now()
);

create table public.objects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  address text not null default '',
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  description text not null default '',
  object_id uuid not null references public.objects (id) on delete cascade,
  assignee_id uuid references public.profiles (id) on delete set null,
  author_id uuid not null default auth.uid() references public.profiles (id),
  status public.task_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_object_id_idx on public.tasks (object_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);

create table public.task_history (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.tasks (id) on delete cascade,
  changed_by uuid references public.profiles (id) on delete set null,
  from_status public.task_status,
  to_status public.task_status not null,
  comment text,
  created_at timestamptz not null default now()
);

create index task_history_task_id_idx on public.task_history (task_id, created_at);

create function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'manager'
  );
$$;

create function public.has_task_in_object(p_object_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tasks
    where object_id = p_object_id and assignee_id = auth.uid()
  );
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    'executor'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create function public.validate_task_assignee()
returns trigger
language plpgsql
as $$
begin
  if new.assignee_id is not null and not exists (
    select 1 from public.profiles where id = new.assignee_id and role = 'executor'
  ) then
    raise exception 'Assignee must be an executor' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger tasks_validate_assignee
before insert or update of assignee_id on public.tasks
for each row execute function public.validate_task_assignee();

create function public.touch_task()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_touch
before update on public.tasks
for each row execute function public.touch_task();

create function public.log_task_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_history (task_id, changed_by, from_status, to_status)
  values (new.id, new.author_id, null, new.status);
  return new;
end;
$$;

create trigger tasks_log_created
after insert on public.tasks
for each row execute function public.log_task_created();

create function public.change_task_status(
  p_task_id uuid,
  p_to public.task_status,
  p_comment text default null
)
returns public.tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_task public.tasks;
  v_required text;
  v_from public.task_status;
  v_comment text := nullif(btrim(coalesce(p_comment, '')), '');
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into v_task from public.tasks where id = p_task_id for update;

  if not found or not (public.is_manager() or v_task.assignee_id = v_uid) then
    raise exception 'Task not found' using errcode = 'P0002';
  end if;

  v_required := case
    when v_task.status = 'new' and p_to = 'in_progress' then 'assignee'
    when v_task.status = 'in_progress' and p_to = 'review' then 'assignee'
    when v_task.status = 'review' and p_to = 'accepted' then 'manager'
    when v_task.status = 'review' and p_to = 'rework' then 'manager'
    when v_task.status = 'rework' and p_to = 'in_progress' then 'assignee'
    else null
  end;

  if v_required is null then
    raise exception 'Transition from % to % is not allowed', v_task.status, p_to
      using errcode = '23514';
  end if;

  if v_required = 'assignee' and v_task.assignee_id is distinct from v_uid then
    raise exception 'Only the assigned executor can do this' using errcode = '42501';
  end if;

  if v_required = 'manager' and not public.is_manager() then
    raise exception 'Only a manager can do this' using errcode = '42501';
  end if;

  if p_to = 'rework' and v_comment is null then
    raise exception 'Comment is required when returning a task for rework' using errcode = '23514';
  end if;

  v_from := v_task.status;
  update public.tasks set status = p_to where id = p_task_id returning * into v_task;

  insert into public.task_history (task_id, changed_by, from_status, to_status, comment)
  values (p_task_id, v_uid, v_from, p_to, v_comment);

  return v_task;
end;
$$;
