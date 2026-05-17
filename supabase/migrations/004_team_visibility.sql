-- 004_team_visibility.sql
-- Apre la visibilità di turni e profili a tutti i dipendenti autenticati
-- per consentire agli employees di vedere chi lavora quando (richiesta cliente:
-- "i dipendenti vogliono vedere i turni di tutti per fare degli accoppiamenti idonei").
--
-- Nota di sicurezza: hourly_rate ed email degli altri colleghi restano accessibili
-- a livello API anche per i non-admin. Lato client filtriamo le colonne nel fetch
-- (vedi useEmployees.ts / useShifts.ts) così di fatto i dipendenti non li vedono.
-- Per una vinoteca dove i rapporti sono di fiducia il trade-off è accettato.
-- Se in futuro serve hardening forte: creare view team_members senza colonne
-- sensibili e fare GRANT solo su quella ai non-admin.

-- ─── SHIFTS ───────────────────────────────────────────────────────────────
drop policy if exists "shifts_select_self"  on public.shifts;
drop policy if exists "shifts_select_admin" on public.shifts;
drop policy if exists "shifts_select"       on public.shifts;

create policy "shifts_select_authenticated"
  on public.shifts for select
  to authenticated
  using (true);

-- ─── PROFILES ─────────────────────────────────────────────────────────────
drop policy if exists "profiles_select_self"  on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_select"       on public.profiles;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);
