# CLAUDE.md — Stuzzico & Vinello Dashboard

## Progetto
Dashboard gestione personale per la vinoteca **Stuzzico & Vinello**.
Proprietario: Nazario (nazario.deletteriis@gmail.com) — ruolo `admin`.

## Stack
- **React 18 + TypeScript + Vite**
- **Tailwind CSS** — tema dark custom (bordeaux `#7b2d3e` / oro `#c9a96e`)
- **Framer Motion** — animazioni UI
- **Supabase** — auth + PostgreSQL + RLS
- **Recharts** — grafici
- **date-fns** — gestione date
- **React Router v6** — routing con future flags attivi

## Percorso progetto
- **WSL / VSCode:** `/var/www/Stuzzico&Vinello`
- **Windows:** `Z:\var\www\Stuzzico&Vinello`
- **Avvio:** `npm run dev` → `http://localhost:5173`

## Supabase
- **URL:** `https://ngfutcevhhqneijoawbf.supabase.co`
- **Anon key:** nel file `.env` (non committare)
- **Admin UID:** `2fb8306a-dacc-4fa3-9d14-f95ff30d725c`

## Database — Tabelle
### `profiles`
| Campo | Tipo | Note |
|-------|------|-------|
| id | uuid | FK → auth.users |
| email | text | |
| name | text | |
| role | text | `'admin'` \| `'employee'` |
| employment_type | text | `'full-time'` \| `'part-time'` \| `'one-shot'` |
| color | text | hex color per calendario |
| **hourly_rate** | numeric(10,2) | **paga €/ora, impostata da admin (default 0)** — vedi migration `002_hourly_rate.sql` |
| created_at / updated_at | timestamptz | |

### `shifts`
| Campo | Tipo | Note |
|-------|------|-------|
| id | uuid | PK |
| employee_id | uuid | FK → profiles |
| date | date | YYYY-MM-DD |
| start_time | time | HH:mm |
| end_time | time | HH:mm |
| hours | numeric | calcolato automaticamente |
| notes | text | nullable |
| approved | boolean | false = inserito da dipendente, true = approvato admin |
| created_at / updated_at | timestamptz | |

## RLS Policies (fix applicato)
Le policy originali causavano **loop infinito** per ricorsione.
Fix: funzione `public.is_admin()` con `SECURITY DEFINER` che bypassa RLS.

Policy attive:
- `profiles_select`: `id = auth.uid() OR is_admin()`
- `profiles_update`: `id = auth.uid() OR is_admin()`
- `profiles_insert`: `is_admin()`
- `profiles_delete`: `is_admin()`
- `shifts_select`: `employee_id = auth.uid() OR is_admin()`
- `shifts_insert`: `employee_id = auth.uid() OR is_admin()`
- `shifts_update`: `is_admin()`
- `shifts_delete`: `is_admin()`

## Bug noti / risolti
1. **Loop infinito fetch** ← **RISOLTO** in `useShifts.ts`
   - Causa: `startOfMonth(new Date())` crea nuovo oggetto Date ad ogni render → `useCallback` si riesegue → loop.
   - Fix: serializzare il mese a stringa `monthKey = format(month, 'yyyy-MM')` come dipendenza.
   - Fix anche in `Dashboard.tsx`: `useMemo(() => startOfMonth(new Date()), [])`.

2. **RLS 500 error** ← **RISOLTO** con `is_admin()` security definer.

3. **React Router warnings** ← **RISOLTO** aggiungendo `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` a `BrowserRouter`.

4. **Admin logout durante creazione dipendente** ← **RISOLTO** in `useEmployees.ts#addEmployee`.
   - Causa: `supabase.auth.signUp()` rimpiazza la sessione attiva con quella del nuovo utente → l'admin veniva loggato fuori.
   - Fix: salvataggio della sessione admin con `getSession()` prima del signUp, ripristino con `setSession({access_token, refresh_token})` subito dopo (anche se il signUp fallisce).

5. **Turni notturni bloccati** ← **RISOLTO** in `Calendario.tsx` e `MieiTurni.tsx`.
   - Causa: validazione `start_time >= end_time` rifiutava turni overnight (es. 19:00→01:00) — caso comune per una vinoteca.
   - Fix: cambiato in `start_time === end_time` (solo blocco i casi uguali). `calcHours` in `useShifts.ts` gestisce già l'overnight aggiungendo 24h se `end <= start`.

6. **`currentMonth` non memoizzato in Dipendenti.tsx** ← **RISOLTO**.
   - Causa: `const currentMonth = startOfMonth(new Date())` creava un nuovo oggetto Date ad ogni render.
   - Fix: wrap in `useMemo(() => startOfMonth(new Date()), [])` per consistenza con `Dashboard.tsx`.

## Bug aperti / da verificare
- [ ] Hard refresh (`Ctrl+Shift+R`) e confermare che il loop fetch sia completamente sparito
- [ ] Testare creazione primo dipendente: admin deve **rimanere loggato** dopo il submit
- [ ] Verificare se Supabase ha "Email confirmation" attivo (Auth → Providers). Se sì, disabilitarlo o il nuovo dipendente non potrà loggarsi senza confermare l'email
- [ ] Testare login dipendente con le credenziali appena create
- [ ] Testare inserimento turni notturni (es. 22:00→02:00) — devono salvare con ore corrette
- [ ] Testare approvazione turni da admin (icona ✓ verde nel calendario)

## Struttura src/
```
src/
  App.tsx                  — routing, ProtectedRoute, BrowserRouter
  main.tsx                 — entry point
  index.css                — Tailwind + scrollbar + print styles
  types/index.ts           — Profile, Shift, MonthlyStats, EMPLOYEE_COLORS
  lib/
    supabase.ts            — client Supabase
    utils.ts               — cn(), formatHours(), getInitials()
  contexts/
    AuthContext.tsx        — AuthProvider, useAuth(), isAdmin
  hooks/
    useShifts.ts           — fetch/add/update/delete/approve turni + monthlyStats
    useEmployees.ts        — fetch/add/update/delete dipendenti
  components/
    layout/
      Sidebar.tsx          — nav collassabile, admin vs employee nav
      Header.tsx           — titolo, data, notifiche, user
      Layout.tsx           — wrapper Sidebar + Header + main
    ui/
      Button.tsx           — varianti: primary/secondary/ghost/danger
      Avatar.tsx           — initials circle con colore dipendente
      Badge.tsx            — Badge + EmploymentBadge
      Modal.tsx            — modal animato con backdrop
      Input.tsx            — Input, Select, Textarea stilizzati
    dashboard/
      StatsCard.tsx        — card con numero animato (framer-motion spring)
  pages/
    Login.tsx              — pagina login con particelle animate
    Dashboard.tsx          — stats, grafico Recharts, tabella mensile (ADMIN)
    Calendario.tsx         — calendario mensile custom, add/approve/delete turni
    Dipendenti.tsx         — cards dipendenti, add/edit/delete (ADMIN)
    MieiTurni.tsx          — vista dipendente: propri turni + inserimento
    Report.tsx             — report mensili per tutti o singolo dipendente
```

## Dipendenti da aggiungere (dalla pagina Dipendenti)
Giorgia, Ilaria, Edoardo, Edoardo jr., Beatrice, Leonardo, Caterina

## GitHub
Repository: `Dashboard_S&V`
Account: https://github.com/Nazariodeletteriis
Da creare e inizializzare.

## Feature — Calcolo paga dipendente (NEW)
- Colonna `profiles.hourly_rate numeric(10,2) default 0` aggiunta via `supabase/migrations/002_hourly_rate.sql`.
- L'admin imposta la paga oraria sia in fase di creazione che modifica (pagina Dipendenti).
- Il calcolo del compenso è dinamico: `hours × hourly_rate` ad ogni inserimento/modifica turno.
- `useShifts.monthlyStats()` ora restituisce anche `total_pay`, `approved_pay`, `pending_hours`.
- Visibilità:
  - **Dashboard (admin):** stat card "Costo mese", colonna "Compenso" per ogni dipendente, "Da approvare" mostra anche il valore € in attesa.
  - **Report (admin):** card "Costo totale" highlighted, colonne "Paga/h" e "Compenso" nella tabella generale, vista dipendente con "Paga oraria" e "Da pagare" + split approvato/in attesa.
  - **Dipendenti (admin):** chip paga oraria sotto al badge contratto, riga "Da pagare questo mese" highlighted nella card.
  - **MieiTurni (dipendente):** card "Guadagno mese" highlighted, paga oraria mostrata sotto, compenso del singolo turno accanto alle ore.
- `formatCurrency(amount, compact?)` in `lib/utils.ts` usa locale `it-IT` e EUR.

## Prossimi passi
1. **Eseguire `supabase/migrations/002_hourly_rate.sql` nel SQL Editor di Supabase** (prima del prossimo `npm run dev`)
2. Verificare fix loop (hard refresh `Ctrl+Shift+R`)
3. Aggiungere i 7 dipendenti dalla UI con paga oraria
4. Inizializzare repo GitHub `Dashboard_S&V`
5. Testare flusso completo admin → dipendente
