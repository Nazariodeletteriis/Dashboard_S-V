-- ============================================================
-- Schema Supabase — Stuzzico & Vinello Dashboard
-- Esegui questo SQL nell'editor SQL del tuo progetto Supabase
-- ============================================================

-- 1. Tabella profili (estende auth.users)
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null,
  name             text not null,
  role             text not null default 'employee' check (role in ('admin', 'employee')),
  employment_type  text not null default 'part-time' check (employment_type in ('full-time', 'part-time', 'one-shot')),
  color            text not null default '#c9a96e',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2. Tabella turni
create table if not exists public.shifts (
  id           uuid primary key default gen_random_uuid(),
  employee_id  uuid not null references public.profiles(id) on delete cascade,
  date         date not null,
  start_time   time not null,
  end_time     time not null,
  hours        numeric(5,2) not null default 0,
  notes        text,
  approved     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3. Indici per performance
create index if not exists shifts_employee_id_idx on public.shifts(employee_id);
create index if not exists shifts_date_idx on public.shifts(date);

-- 4. Trigger per updated_at automatico
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_shifts_updated
  before update on public.shifts
  for each row execute function public.handle_updated_at();

-- 5. Trigger per creare profilo automaticamente al signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, role, employment_type, color)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'employee'),
    coalesce(new.raw_user_meta_data->>'employment_type', 'part-time'),
    coalesce(new.raw_user_meta_data->>'color', '#c9a96e')
  )
  on conflict (id) do update set
    email = excluded.email,
    name  = coalesce(excluded.name, profiles.name);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 6. Row Level Security (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.shifts   enable row level security;

-- Profiles: admin vede tutti, employee vede solo se stesso
create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles_select_self" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update_admin" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());

create policy "profiles_insert_admin" on public.profiles
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles_delete_admin" on public.profiles
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Shifts: admin vede tutti, employee vede solo i propri
create policy "shifts_select_admin" on public.shifts
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "shifts_select_self" on public.shifts
  for select using (employee_id = auth.uid());

create policy "shifts_insert_admin" on public.shifts
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "shifts_insert_self" on public.shifts
  for insert with check (employee_id = auth.uid());

create policy "shifts_update_admin" on public.shifts
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "shifts_delete_admin" on public.shifts
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 7. Crea admin iniziale — MODIFICA email e password!
-- ============================================================
-- Esegui prima il signup dal sito (o da Supabase Auth > Users),
-- poi promuovi l'utente ad admin con questo UPDATE:
--
-- update public.profiles
-- set role = 'admin'
-- where email = 'tua-email@example.com';
--
-- ============================================================
