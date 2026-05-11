export type EmploymentType = 'full-time' | 'part-time' | 'one-shot'
export type UserRole = 'admin' | 'employee'

export interface Profile {
  id: string
  email: string
  name: string
  role: UserRole
  employment_type: EmploymentType
  color: string
  hourly_rate: number   // €/ora — impostata dall'admin (0 = non configurata)
  created_at: string
  updated_at: string
}

export interface Shift {
  id: string
  employee_id: string
  date: string          // ISO date string YYYY-MM-DD
  start_time: string    // HH:mm
  end_time: string      // HH:mm
  hours: number         // computed
  notes: string | null
  approved: boolean
  created_at: string
  updated_at: string
  // joined
  profile?: Profile
}

export interface MonthlyStats {
  employee_id: string
  name: string
  color: string
  total_hours: number
  shift_count: number
  employment_type: EmploymentType
  hourly_rate: number
  total_pay: number          // €, calcolato su tutte le ore (approvate + in attesa)
  approved_hours: number
  pending_hours: number
  approved_pay: number       // €, solo turni approvati
}

export interface DashboardStats {
  total_employees: number
  total_hours_month: number
  shifts_today: number
  shifts_week: number
}

export interface NewShift {
  employee_id: string
  date: string
  start_time: string
  end_time: string
  notes?: string
}

export interface NewEmployee {
  email: string
  name: string
  employment_type: EmploymentType
  color: string
  password: string
  hourly_rate?: number   // default 0
}

// Color palette for employees — fluo/neon: alta saturazione, massimo contrasto sul
// background wine-800. Spezza intenzionalmente col tema bordeaux/oro per far "saltare"
// ogni dipendente nelle viste fitte (calendario, grafici).
export const EMPLOYEE_COLORS = [
  '#FF2D6F', // hot pink fluo
  '#00E5C7', // turchese fluo
  '#FFD60A', // giallo zafferano brillante
  '#A855F7', // viola elettrico
  '#FF6B1A', // arancio neon
  '#22D3FF', // ciano elettrico
  '#A0E635', // verde lime acido
  '#FF45E5', // magenta fluo
  '#14F195', // verde fluo
  '#FF8AD9', // rosa caramella
]
