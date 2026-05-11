import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, NewEmployee } from '@/types'
import { EMPLOYEE_COLORS } from '@/types'

export function useEmployees() {
  const [employees, setEmployees] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .order('name')
    if (error) {
      setError(error.message)
    } else {
      setEmployees(data as Profile[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const addEmployee = async (data: NewEmployee): Promise<{ error: string | null }> => {
    // ⚠️ Bug noto di Supabase: supabase.auth.signUp() rimpiazza la sessione attiva
    // con quella del nuovo utente — questo logga fuori l'admin. Salviamo la sessione
    // admin PRIMA del signUp e la ripristiniamo subito dopo con setSession().
    const { data: { session: adminSession } } = await supabase.auth.getSession()
    const assignedColor = data.color || EMPLOYEE_COLORS[employees.length % EMPLOYEE_COLORS.length]
    const hourlyRate    = data.hourly_rate ?? 0

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: 'employee',
          employment_type: data.employment_type,
          color: assignedColor,
          hourly_rate: hourlyRate,
        },
      },
    })

    // Ripristina la sessione admin SUBITO (anche in caso di errore parziale),
    // così le query successive girano col ruolo admin e is_admin() torna true.
    if (adminSession) {
      await supabase.auth.setSession({
        access_token:  adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      })
    }

    if (authError) return { error: authError.message }
    if (!authData.user) return { error: 'Errore nella creazione utente' }

    // Upsert profile (ora siamo di nuovo loggati come admin → policy is_admin() passa)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      email: data.email,
      name: data.name,
      role: 'employee',
      employment_type: data.employment_type,
      color: assignedColor,
      hourly_rate: hourlyRate,
    })
    if (profileError) return { error: profileError.message }

    await fetchEmployees()
    return { error: null }
  }

  const updateEmployee = async (id: string, updates: Partial<Profile>): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', id)
    if (error) return { error: error.message }
    await fetchEmployees()
    return { error: null }
  }

  const deleteEmployee = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) return { error: error.message }
    await fetchEmployees()
    return { error: null }
  }

  return { employees, loading, error, refetch: fetchEmployees, addEmployee, updateEmployee, deleteEmployee }
}
