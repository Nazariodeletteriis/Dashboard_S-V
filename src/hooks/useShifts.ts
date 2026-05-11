import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Shift, NewShift, MonthlyStats } from '@/types'
import { format, startOfMonth, endOfMonth, differenceInMinutes, parse } from 'date-fns'

function calcHours(startTime: string, endTime: string): number {
  const base = new Date()
  const start = parse(startTime, 'HH:mm', base)
  let end = parse(endTime, 'HH:mm', base)
  // handle overnight shifts
  if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000)
  return Math.round((differenceInMinutes(end, start) / 60) * 100) / 100
}

export function useShifts(month?: Date, employeeId?: string) {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Serialize to string so useCallback doesn't re-fire on every render
  // (new Date() creates a new object reference every time → infinite loop)
  const monthKey = month ? format(startOfMonth(month), 'yyyy-MM') : undefined

  const fetchShifts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('shifts')
      .select('*, profile:profiles(id,name,color,employment_type,role,hourly_rate)')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (monthKey) {
      const from = `${monthKey}-01`
      const to   = format(endOfMonth(new Date(`${monthKey}-01`)), 'yyyy-MM-dd')
      query = query.gte('date', from).lte('date', to)
    }
    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query
    if (error) {
      setError(error.message)
    } else {
      setShifts(data as Shift[])
    }
    setLoading(false)
  }, [monthKey, employeeId])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  const addShift = async (data: NewShift): Promise<{ error: string | null }> => {
    const hours = calcHours(data.start_time, data.end_time)
    const { error } = await supabase.from('shifts').insert({
      ...data,
      hours,
      approved: false,
    })
    if (error) return { error: error.message }
    await fetchShifts()
    return { error: null }
  }

  const updateShift = async (id: string, updates: Partial<Shift>): Promise<{ error: string | null }> => {
    const payload = { ...updates }
    if (updates.start_time && updates.end_time) {
      payload.hours = calcHours(updates.start_time, updates.end_time)
    }
    const { error } = await supabase.from('shifts').update(payload).eq('id', id)
    if (error) return { error: error.message }
    await fetchShifts()
    return { error: null }
  }

  const deleteShift = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('shifts').delete().eq('id', id)
    if (error) return { error: error.message }
    await fetchShifts()
    return { error: null }
  }

  const approveShift = async (id: string): Promise<{ error: string | null }> => {
    return updateShift(id, { approved: true } as Partial<Shift>)
  }

  // compute monthly stats per employee
  const monthlyStats = useCallback((): MonthlyStats[] => {
    const map = new Map<string, MonthlyStats>()
    shifts.forEach(s => {
      if (!s.profile) return
      const rate = s.profile.hourly_rate ?? 0
      const pay  = s.hours * rate
      let existing = map.get(s.employee_id)
      if (!existing) {
        existing = {
          employee_id:     s.employee_id,
          name:            s.profile.name,
          color:           s.profile.color,
          employment_type: s.profile.employment_type,
          hourly_rate:     rate,
          total_hours:     0,
          shift_count:     0,
          total_pay:       0,
          approved_hours:  0,
          approved_pay:    0,
          pending_hours:   0,
        }
        map.set(s.employee_id, existing)
      }
      existing.total_hours += s.hours
      existing.total_pay   += pay
      existing.shift_count++
      if (s.approved) {
        existing.approved_hours += s.hours
        existing.approved_pay   += pay
      } else {
        existing.pending_hours  += s.hours
      }
    })
    return Array.from(map.values()).sort((a, b) => b.total_hours - a.total_hours)
  }, [shifts])

  return { shifts, loading, error, refetch: fetchShifts, addShift, updateShift, deleteShift, approveShift, monthlyStats }
}

// Hook for today's shifts (used in dashboard)
export function useTodayShifts() {
  const today = new Date()
  return useShifts(today)
}
