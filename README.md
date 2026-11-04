# construction-crm

Мини-CRM «Объекты и задачи»: React + TypeScript (Vite, архитектура FSD) и Supabase.

## Запуск

1. Создайте проект в Supabase и отключите открытую регистрацию: Authentication → Sign In / Providers → Email → Allow new users to sign up.
2. Создайте пользователей в Authentication → Users (минимум 3, с Auto Confirm User).
3. В SQL Editor выполните по порядку файлы из `supabase/migrations/`, затем `supabase/seed.sql`. Самый ранний пользователь становится постановщиком, следующие два исполнителями.
4. Скопируйте `.env.example` в `.env` и заполните `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` (публичный ключ anon). Ключ `service_role` во фронтенд и в репозиторий не попадает.
5. Запустите:

```bash
npm install
npm run dev
```

Через Docker:

```bash
docker compose --profile dev up dev
docker compose up --build web
```

Первая команда запускает режим разработки на `http://localhost:5173`, вторая прод-сборку на `http://localhost:8080`.

## Структура

`src/app`, `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared` по Feature-Sliced Design.

## Безопасность

- RLS включён на всех таблицах, права выдаются явно.
- Статус задачи меняется только функцией `change_task_status`, которая проверяет роль, исполнителя, допустимый переход и комментарий.
- История статусов доступна только на чтение, записи создаются внутри базы.
- Исполнитель видит только свои задачи и объекты, в которых они есть.

### Vercel: https://construction-crm-psi.vercel.app/