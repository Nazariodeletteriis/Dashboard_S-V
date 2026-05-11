# 🍷 Stuzzico & Vinello — Dashboard Gestione Personale

Dashboard professionale per la gestione del personale della vinoteca **Stuzzico & Vinello**.

## Stack

- **React 18** + TypeScript + Vite
- **Tailwind CSS** — tema dark bordeaux/oro custom
- **Framer Motion** — animazioni UI
- **Supabase** — auth, database PostgreSQL, RLS
- **Recharts** — grafici
- **date-fns** — gestione date

---

## Setup in 5 passi

### 1. Installa le dipendenze

```bash
cd /var/www/Stuzzico\&Vinello
npm install
```

### 2. Crea il progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto
2. Copia **Project URL** e **anon public key** dalle Settings > API
3. Crea il file `.env` nella root del progetto:

```bash
cp .env.example .env
```

Poi modifica `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Esegui lo schema SQL

1. Vai su **Supabase > SQL Editor**
2. Copia e incolla il contenuto di `supabase/schema.sql`
3. Clicca **Run**
4. (Migration paga oraria) Esegui anche `supabase/migrations/002_hourly_rate.sql`

### 4. Crea il primo admin

1. Vai su **Supabase > Authentication > Users**
2. Clicca **Add user** → inserisci la tua email e password
3. Vai su **SQL Editor** e promuovi ad admin:

```sql
update public.profiles
set role = 'admin'
where email = 'tua-email@stuzzicovinello.it';
```

### 5. Avvia il progetto

```bash
npm run dev
```

Apri `http://localhost:5173`

---

## Dipendenti pre-configurati

Vai su **Dipendenti > Aggiungi** per creare i profili di:

| Nome | Tipo suggerito |
|------|---------------|
| Giorgia | Part-time |
| Ilaria | Part-time |
| Edoardo | Full-time |
| Edoardo jr. | Part-time |
| Beatrice | Part-time |
| Leonardo | Full-time |
| Caterina | Part-time |

---

## Funzionalità

- **Login** — Admin (gestione completa) e Dipendente (propri turni)
- **Dashboard** — statistiche mensili, grafici, turni da approvare, costo totale del mese in tempo reale
- **Calendario** — turni mensili color-coded per dipendente, turni notturni supportati (es. 19:00→01:00), burst sparkle all'approvazione
- **Dipendenti** — gestione completa (add/edit/delete), tipi: full-time, part-time, serata, paga oraria modificabile
- **Report** — ore mensili e compenso per dipendente, split approvato vs in attesa, stampa, tabelle
- **I miei turni** — vista dipendente, inserimento turni, storico, guadagno del mese e per singolo turno

### Calcolo paga
Ogni dipendente ha una `hourly_rate` impostata dall'admin. Il compenso si calcola dinamicamente come `ore × paga_oraria` ad ogni inserimento/modifica turno. Visibile in Dashboard, Report, pagina Dipendenti e MieiTurni.

### Stile
- Sfondo animato globale (orbi gold/wine + grid + grain SVG)
- Sidebar con pill animata (`layoutId`) che scivola tra le voci attive
- Page transitions con `AnimatePresence`
- StatsCard con tilt 3D parallax al passaggio del mouse
- Login con calice SVG che si riempie + blob in parallax sul mouse

---

## Build produzione

```bash
npm run build
```

L'output va in `dist/`. Deployabile su Vercel, Netlify, o qualsiasi host statico.

---

## Repository GitHub

`Dashboard_S&V` — https://github.com/Nazariodeletteriis/Dashboard_S-V
