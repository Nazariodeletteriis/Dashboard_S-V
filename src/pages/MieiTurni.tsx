import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, parseISO, isToday, isFuture } from 'date-fns'
import { it } from 'date-fns/locale'
import { Plus, Clock, Euro, Calendar, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useShifts } from '@/hooks/useShifts'
import { useAuth } from '@/contexts/AuthContext'
import { formatHours, formatCurrency } from '@/lib/utils'

export default function MieiTurni() {
  const { profile } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '18:00',
    end_time: '23:00',
    notes: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { shifts, loading, addShift } = useShifts(currentMonth, profile?.id)

  const totalHours      = shifts.reduce((acc, s) => acc + s.hours, 0)
  const totalShifts     = shifts.length
  const pendingApproval = shifts.filter(s => !s.approved).length
  const hourlyRate      = profile?.hourly_rate ?? 0
  const totalPay        = totalHours * hourlyRate

  const prevMonth = () => setCurrentMonth(m => startOfMonth(new Date(m.getFullYear(), m.getMonth() - 1)))
  const nextMonth = () => setCurrentMonth(m => startOfMonth(new Date(m.getFullYear(), m.getMonth() + 1)))

  const handleAdd = async () => {
    if (!form.date || !form.start_time || !form.end_time) {
      setFormError('Compila tutti i campi.')
      return
    }
    if (form.start_time === form.end_time) {
      setFormError('Inizio e fine non possono coincidere.')
      return
    }
    // Nota: start > end è valido per turni notturni (es. 19:00→01:00).
    // calcHours in useShifts.ts gestisce automaticamente l'overnight.
    if (!profile?.id) return
    setSubmitting(true)
    const { error } = await addShift({ ...form, employee_id: profile.id })
    setSubmitting(false)
    if (error) { setFormError(error); return }
    setAddOpen(false)
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), start_time: '18:00', end_time: '23:00', notes: '' })
  }

  return (
    <Layout
      title={`Ciao, ${profile?.name?.split(' ')[0]} 👋`}
      subtitle="I tuoi turni di lavoro"
    >
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Ore questo mese',  value: formatHours(totalHours), icon: Clock,    color: 'text-gold-500',     highlight: false },
            { label: 'Turni registrati', value: totalShifts.toString(),  icon: CheckCircle, color: 'text-emerald-400', highlight: false },
            {
              label: 'Guadagno mese',
              value: hourlyRate > 0 ? formatCurrency(totalPay) : '—',
              icon:  Euro,
              color: 'text-gold-400',
              highlight: true,
            },
          ].map(({ label, value, icon: Icon, color, highlight }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`border rounded-2xl p-4 text-center ${
                highlight
                  ? 'bg-gradient-to-br from-gold-500/10 to-wine-800 border-gold-500/30'
                  : 'bg-wine-800 border-wine-700/40'
              }`}
            >
              <Icon size={20} className={`${color} mx-auto mb-2`} />
              <p className={`text-xl font-semibold ${highlight ? 'text-gold-400' : 'text-cream'}`}>{value}</p>
              <p className="text-xs text-cream-darker mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Info contestuali: paga oraria + turni in attesa */}
        {(hourlyRate > 0 || pendingApproval > 0) && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-cream-darker -mt-1">
            {hourlyRate > 0 && (
              <span>Paga oraria: <span className="text-cream-muted font-medium">{formatCurrency(hourlyRate)}/h</span></span>
            )}
            {pendingApproval > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle size={12} className="text-gold-400" />
                <span>{pendingApproval} turn{pendingApproval === 1 ? 'o' : 'i'} in attesa di approvazione</span>
              </span>
            )}
          </div>
        )}

        {/* Month controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-wine-700/50 text-cream-muted hover:text-cream transition-colors">
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-base font-semibold text-cream capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: it })}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-wine-700/50 text-cream-muted hover:text-cream transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => { setFormError(null); setAddOpen(true) }}>
            Inserisci turno
          </Button>
        </div>

        {/* Shifts list */}
        <motion.div
          className="bg-wine-800 border border-wine-700/40 rounded-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : shifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-cream-darker">
              <Calendar size={32} className="opacity-30" />
              <p className="text-sm">Nessun turno questo mese</p>
              <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
                Inserisci il primo turno
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-wine-700/20">
              {shifts.map((shift, i) => {
                const date      = parseISO(shift.date)
                const isNow     = isToday(date)
                const upcoming  = isFuture(date)
                return (
                  <motion.div
                    key={shift.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-4 px-5 py-4 ${isNow ? 'bg-gold-500/5' : ''}`}
                  >
                    {/* Date */}
                    <div className="text-center w-12 flex-shrink-0">
                      <p className="text-xl font-semibold text-cream leading-none">{format(date, 'd')}</p>
                      <p className="text-xs text-cream-darker capitalize">{format(date, 'EEE', { locale: it })}</p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cream font-medium">
                        {shift.start_time} – {shift.end_time}
                        <span className="text-gold-500 ml-2">{formatHours(shift.hours)}</span>
                        {hourlyRate > 0 && (
                          <span className="text-cream-darker ml-2 text-xs">
                            · {formatCurrency(shift.hours * hourlyRate)}
                          </span>
                        )}
                      </p>
                      {shift.notes && (
                        <p className="text-xs text-cream-darker mt-0.5 italic truncate">"{shift.notes}"</p>
                      )}
                    </div>

                    {/* Status */}
                    {shift.approved ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle size={14} />
                        <span className="hidden sm:inline">Approvato</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-gold-400">
                        <AlertCircle size={14} />
                        <span className="hidden sm:inline">In attesa</span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add shift modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Inserisci turno">
        <div className="space-y-4">
          <Input label="Data" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Inizio" type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            <Input label="Fine"   type="time" value={form.end_time}   onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
          </div>
          <Textarea label="Note (opzionale)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Es: aperitivo, serata evento..." />
          <AnimatePresence>
            {formError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2">
                {formError}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="flex gap-3 pt-1">
            <Button variant="ghost" size="md" onClick={() => setAddOpen(false)} className="flex-1">Annulla</Button>
            <Button variant="primary" size="md" loading={submitting} onClick={handleAdd} className="flex-1">Salva turno</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
