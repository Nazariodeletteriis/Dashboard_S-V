-- Migration 003: riassegnazione colori dipendenti alla palette fluo
-- Da eseguire SOLO se hai già creato i dipendenti con la vecchia palette muted.
-- Idempotente: si può rieseguire — semplicemente rimette i colori in ordine alfabetico.
--
-- Esegui in Supabase → SQL Editor → New query.

with ordered as (
  select id,
         (row_number() over (order by name) - 1) % 10 as idx
  from public.profiles
  where role = 'employee'
),
palette(idx, color) as (
  values
    (0, '#FF2D6F'),  -- hot pink fluo
    (1, '#00E5C7'),  -- turchese fluo
    (2, '#FFD60A'),  -- giallo zafferano brillante
    (3, '#A855F7'),  -- viola elettrico
    (4, '#FF6B1A'),  -- arancio neon
    (5, '#22D3FF'),  -- ciano elettrico
    (6, '#A0E635'),  -- verde lime acido
    (7, '#FF45E5'),  -- magenta fluo
    (8, '#14F195'),  -- verde fluo
    (9, '#FF8AD9')   -- rosa caramella
)
update public.profiles p
set color = pal.color
from ordered o
join palette pal on pal.idx = o.idx
where p.id = o.id;
