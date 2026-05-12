import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay,
} from 'date-fns'
import { it } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, X, Check, Clock } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Sparkle } from '@/components/ui/Sparkle'
import { useShifts } from '@/hooks/useShifts'
import { useEmployees } from '@/hooks/useEmployees'
import { useAuth } from '@/contexts/AuthContext'
import { formatHours } from '@/lib/utils'
import type { Shift } from '@/types'

const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export default function Calendario() {
  const { isAdmin, profile } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  const [selectedDay, setSelectedDay]   = useState<Date | null>(null)
  const [filterEmployee, setFilterEmployee] = useState<string>('all')
  const [addOpen, setAddOpen]   = useState(false)
  const [dayOpen, setDayOpen]   = useState(false)

  // Form state
  const [form, setForm] = useState({
    employee_id: '',
    date: '',
    start_time: '18:00',
    end_time: '23:00',
    notes: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { shifts, loading, addShift, deleteShift, approveShift } = useShifts(currentMonth)
  const { employees } = useEmployees()

  // Sparkle burst quando admin approva un turno (id del turno appena approvato)
  const [sparkleId, setSparkleId] = useState<string | null>(null)
  useEffect(() => {
    if (!sparkleId) return
    const t = setTimeout(() => setSparkleId(null), 700)
    return () => clearTimeout(t)
  }, [sparkleId])

  const handleApprove = async (id: string) => {
    setSparkleId(id)
    await approveShift(id)
  }

  // Days grid
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end   = endOfWeek(endOfMonth(currentMonth),     { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // Shifts for a specific day (filtered)
  const shiftsForDay = (day: Date): Shift[] => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return shifts.filter(s => {
      const matchDay = s.date === dateStr
      const matchEmp = filterEmployee === 'all' || s.employee_id === filterEmployee
      return matchDay && matchEmp
    })
  }

  // Shifts for selected day
  const selectedDayShifts = selectedDay ? shiftsForDay(selectedDay) : []

  const prevMonth = () => setCurrentMonth(m => startOfMonth(new Date(m.getFullYear(), m.getMonth() - 1)))
  const nextMonth = () => setCurrentMonth(m => startOfMonth(new Date(m.getFullYear(), m.getMonth() + 1)))

  const openAddModal = (day?: Date) => {
    setForm({
      employee_id: isAdmin ? (employees[0]?.id ?? '') : (profile?.id ?? ''),
      date:        format(day ?? new Date(), 'yyyy-MM-dd'),
      start_time:  '18:00',
      end_time:    '23:00',
      notes:       '',
    })
    setFormError(null)
    setAddOpen(true)
  }

  const handleAdd = async () => {
    if (!form.employee_id || !form.date || !form.start_time || !form.end_time) {
      setFormError('Compila tutti i campi obbligatori.')
      return
    }
    if (form.start_time === form.end_time) {
      setFormError('Inizio e fine non possono coincidere.')
      return
    }
    // Nota: start > end è valido per turni notturni (es. 19:00→01:00).
    // calcHours in useShifts.ts gestisce automaticamente l'overnight.
    setSubmitting(true)
    const { error } = await addShift(form)
    setSubmitting(false)
    if (error) { setFormError(error); return }
    setAddOpen(false)
  }

  return (
    <Layout title="Calendario" subtitle="Turni mensili del personale">
      <div className="space-y-4">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Month nav */}
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-wine-700/50 text-cream-muted hover:text-cream transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold text-cream capitalize min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: it })}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-wine-700/50 text-cream-muted hover:text-cream transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Filter by employee */}
            {isAdmin && (
              <select
                value={filterEmployee}
                onChange={e => setFilterEmployee(e.target.value)}
                className="flex-1 sm:flex-none bg-wine-800 border border-wine-600/50 rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold-500/60 cursor-pointer"
                aria-label="Filtra per dipendente"
              >
                <option value="all" className="bg-wine-800">Tutti i dipendenti</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id} className="bg-wine-800">{e.name}</option>
                ))}
              </select>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={15} />}
              onClick={() => openAddModal()}
            >
              <span className="hidden sm:inline">Aggiungi turno</span>
              <span className="sm:hidden">Turno</span>
            </Button>
          </div>
        </div>

        {/* Calendar grid */}
        <motion.div
          key={format(currentMonth, 'yyyy-MM')}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-wine-800 border border-wine-700/40 rounded-2xl overflow-hidden"
        >
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-wine-700/40">
            {DAYS.map(d => (
              <div key={d} className="py-3 text-center text-xs font-medium text-cream-darker uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* MOBILE (< lg): mese compatto coi pallini colorati */}
              <div className="grid grid-cols-7 lg:hidden">
                {days.map((day, idx) => {
                  const dayShifts  = shiftsForDay(day)
                  const inMonth    = isSameMonth(day, currentMonth)
                  const todayDay   = isToday(day)
                  const isSelected = selectedDay && isSameDay(day, selectedDay)
                  // Colori unici (fino a 4 pallini, +N oltre)
                  const dotColors  = Array.from(new Set(dayShifts.map(s => s.profile?.color).filter(Boolean))) as string[]

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDay(day)
                        setDayOpen(true)
                      }}
                      className={`
                        relative aspect-square flex flex-col items-center justify-center gap-1 p-1
                        border-b border-r border-wine-700/20 transition-colors
                        ${!inMonth ? 'opacity-30' : ''}
                        ${todayDay ? 'bg-wine-700/30' : 'active:bg-wine-700/30'}
                        ${isSelected ? 'ring-1 ring-inset ring-gold-500/40' : ''}
                      `}
                      aria-label={`${format(day, 'd MMMM', { locale: it })}, ${dayShifts.length} turn${dayShifts.length === 1 ? 'o' : 'i'}`}
                    >
                      <span className={`
                        text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full
                        ${todayDay ? 'bg-gold-500 text-wine-900' : 'text-cream-muted'}
                      `}>
                        {format(day, 'd')}
                      </span>

                      {/* Dots colorati per dipendente unico, max 4 visibili */}
                      <div className="flex items-center justify-center gap-0.5 min-h-[8px]">
                        {dotColors.slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: c, boxShadow: `0 0 4px ${c}66` }}
                          />
                        ))}
                        {dotColors.length > 4 && (
                          <span className="text-[9px] text-cream-darker leading-none">+{dotColors.length - 4}</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* DESKTOP (lg+): griglia classica con nomi nelle celle */}
              <div className="hidden lg:grid grid-cols-7">
                {days.map((day, idx) => {
                  const dayShifts  = shiftsForDay(day)
                  const inMonth    = isSameMonth(day, currentMonth)
                  const todayDay   = isToday(day)
                  const isSelected = selectedDay && isSameDay(day, selectedDay)

                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedDay(day)
                        setDayOpen(true)
                      }}
                      className={`
                        min-h-[88px] p-2 text-left border-b border-r border-wine-700/20 transition-colors
                        ${!inMonth ? 'opacity-30' : ''}
                        ${todayDay ? 'bg-wine-700/30' : 'hover:bg-wine-700/20'}
                        ${isSelected ? 'ring-1 ring-inset ring-gold-500/40' : ''}
                      `}
                    >
                      <span className={`
                        text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full mb-1
                        ${todayDay ? 'bg-gold-500 text-wine-900' : 'text-cream-muted'}
                      `}>
                        {format(day, 'd')}
                      </span>

                      {/* Shifts dots */}
                      <div className="space-y-0.5">
                        {dayShifts.slice(0, 3).map(shift => (
                          <div
                            key={shift.id}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate"
                            style={{ background: `${shift.profile?.color ?? '#7b2d3e'}22`, color: shift.profile?.color ?? '#c9a96e' }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: shift.profile?.color }} />
                            <span className="truncate">{shift.profile?.name?.split(' ')[0]}</span>
                          </div>
                        ))}
                        {dayShifts.length > 3 && (
                          <p className="text-xs text-cream-darker pl-1">+{dayShifts.length - 3}</p>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </>
          )}
        </motion.div>

        {/* Legend */}
        {isAdmin && (
          <div className="flex flex-wrap gap-3 px-1">
            {employees.map(emp => (
              <div key={emp.id} className="flex items-center gap-1.5 text-xs text-cream-muted">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: emp.color }} />
                {emp.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Day detail modal */}
      <Modal
        open={dayOpen}
        onClose={() => setDayOpen(false)}
        title={selectedDay ? format(selectedDay, 'EEEE d MMMM yyyy', { locale: it }) : ''}
        size="md"
      >
        <div className="space-y-3">
          {selectedDayShifts.length === 0 ? (
            <p className="text-center text-cream-darker py-6">Nessun turno registrato</p>
          ) : (
            selectedDayShifts.map(shift => (
              <div key={shift.id} className="flex items-center gap-3 p-3 rounded-xl bg-wine-700/30 border border-wine-600/20">
                {shift.profile && <Avatar name={shift.profile.name} color={shift.profile.color} size="sm" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-cream">{shift.profile?.name}</p>
                  <p className="text-xs text-cream-darker flex items-center gap-1 mt-0.5">
                    <Clock size={11} />
                    {shift.start_time} – {shift.end_time} ({formatHours(shift.hours)})
                  </p>
                  {shift.notes && <p className="text-xs text-cream-muted mt-0.5 italic">"{shift.notes}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && !shift.approved && (
                    <motion.button
                      onClick={() => handleApprove(shift.id)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      className="relative p-1.5 rounded-lg bg-emerald-900/30 text-emerald-400 hover:bg-emerald-800/40 transition-colors"
                    >
                      <Check size={14} />
                      <Sparkle trigger={sparkleId === shift.id} />
                    </motion.button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => deleteShift(shift.id)}
                      className="p-1.5 rounded-lg hover:bg-red-900/30 text-cream-darker hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <div className={`w-2 h-2 rounded-full ${shift.approved ? 'bg-emerald-500' : 'bg-gold-500'}`} />
                </div>
              </div>
            ))
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => {
              setDayOpen(false)
              openAddModal(selectedDay ?? undefined)
            }}
            className="w-full"
          >
            Aggiungi turno per questo giorno
          </Button>
        </div>
      </Modal>

      {/* Add shift modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Aggiungi turno" size="md">
        <div className="space-y-4">
          {isAdmin && (
            <Select
              label="Dipendente"
              value={form.employee_id}
              onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
              options={employees.map(e => ({ value: e.id, label: e.name }))}
            />
          )}
          <Input
            label="Data"
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Inizio"
              type="time"
              value={form.start_time}
              onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
            />
            <Input
              label="Fine"
              type="time"
              value={form.end_time}
              onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
            />
          </div>
          <Textarea
            label="Note (opzionale)"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            placeholder="Es: serata evento, aperitivo..."
          />

          <AnimatePresence>
            {formError && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2"
              >
                {formError}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-1">
            <Button variant="ghost" size="md" onClick={() => setAddOpen(false)} className="flex-1">
              Annulla
            </Button>
            <Button variant="primary" size="md" loading={submitting} onClick={handleAdd} className="flex-1">
              Salva turno
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
