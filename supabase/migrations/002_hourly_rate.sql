-- Migration 002: paga oraria dipendente
-- Esegui questo blocco nel SQL Editor di Supabase (Dashboard → SQL Editor → New query)
-- Idempotente: si può rieseguire senza errori.

alter table public.profiles
  add column if not exists hourly_rate numeric(10, 2) not null default 0;

comment on column public.profiles.hourly_rate is
  'Paga oraria in euro. Impostata dall''admin. Default 0 = non ancora configurata.';

-- Nessuna modifica RLS: la policy SELECT (id = auth.uid() OR is_admin()) si applica
-- automaticamente alla colonna. Il dipendente legge la propria paga, l''admin tutte.
