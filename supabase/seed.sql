create function pg_temp.seed_task(
  p_title text,
  p_description text,
  p_object_id uuid,
  p_assignee_id uuid,
  p_author_id uuid,
  p_path public.task_status[],
  p_comment text default null
)
returns void
language plpgsql
as $$
declare
  v_id uuid;
  v_prev public.task_status := 'new';
  v_to public.task_status;
begin
  insert into public.tasks (title, description, object_id, assignee_id, author_id)
  values (p_title, p_description, p_object_id, p_assignee_id, p_author_id)
  returning id into v_id;

  foreach v_to in array p_path loop
    insert into public.task_history (task_id, changed_by, from_status, to_status, comment, created_at)
    values (
      v_id,
      case when v_to in ('accepted', 'rework') then p_author_id else p_assignee_id end,
      v_prev,
      v_to,
      case when v_to = 'rework' then p_comment end,
      clock_timestamp()
    );
    v_prev := v_to;
  end loop;

  update public.tasks set status = v_prev where id = v_id;
end;
$$;

do $$
declare
  v_users uuid[];
  v_manager uuid;
  v_exec1 uuid;
  v_exec2 uuid;
  v_obj1 uuid;
  v_obj2 uuid;
  v_obj3 uuid;
begin
  insert into public.profiles (id, email, full_name, created_at)
  select id, email, split_part(email, '@', 1), created_at
  from auth.users
  on conflict (id) do nothing;

  select array_agg(id order by created_at, id) into v_users from public.profiles;

  if coalesce(array_length(v_users, 1), 0) < 3 then
    raise exception 'Create at least 3 users first: the earliest becomes the manager, the next two become executors';
  end if;

  v_manager := v_users[1];
  v_exec1 := v_users[2];
  v_exec2 := v_users[3];

  update public.profiles set role = 'manager', full_name = 'Анна Руководитель' where id = v_manager;
  update public.profiles set full_name = 'Иван Исполнитель' where id = v_exec1;
  update public.profiles set full_name = 'Пётр Исполнитель' where id = v_exec2;

  insert into public.objects (name, address, created_by)
  values ('ЖК «Северный»', 'г. Москва, ул. Северная, 12', v_manager)
  returning id into v_obj1;

  insert into public.objects (name, address, created_by)
  values ('Склад «Восток»', 'г. Подольск, пр-т Индустриальный, 4', v_manager)
  returning id into v_obj2;

  insert into public.objects (name, address, created_by)
  values ('Офисный центр «Атриум»', 'г. Москва, Тверская ул., 30', v_manager)
  returning id into v_obj3;

  perform pg_temp.seed_task('Залить фундамент секции А', 'Бетон B25, контроль армирования', v_obj1, v_exec1, v_manager, array[]::public.task_status[]);
  perform pg_temp.seed_task('Монтаж опалубки секции Б', 'Согласно проекту КЖ-2', v_obj1, v_exec1, v_manager, array['in_progress']::public.task_status[]);
  perform pg_temp.seed_task('Принять арматуру на площадке', 'Проверить сертификаты', v_obj1, v_exec2, v_manager, array['in_progress', 'review']::public.task_status[]);
  perform pg_temp.seed_task('Разметка осей склада', 'Геодезическая разметка', v_obj2, v_exec2, v_manager, array['in_progress', 'review', 'accepted']::public.task_status[]);
  perform pg_temp.seed_task('Монтаж кровельных панелей', 'Фото узлов примыкания', v_obj2, v_exec1, v_manager, array['in_progress', 'review', 'rework']::public.task_status[], 'Не хватает фотографий узлов примыкания');
  perform pg_temp.seed_task('Электрика 1 этажа', 'Прокладка кабельных трасс', v_obj3, v_exec2, v_manager, array['in_progress']::public.task_status[]);
  perform pg_temp.seed_task('Отделка холла', 'Черновая отделка стен', v_obj3, v_exec1, v_manager, array[]::public.task_status[]);
end;
$$;
