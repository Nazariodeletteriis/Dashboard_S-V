import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Users, Clock, Calendar } from 'lucide-react'
import { format, startOfMonth } from 'date-fns'
import { it } from 'date-fns/locale'
import { Layout } from '@/components/layout/Layout'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { EmploymentBadge } from '@/components/ui/Badge'
import { useEmployees } from '@/hooks/useEmployees'
import { useShifts } from '@/hooks/useShifts'
import { formatHours, formatCurrency } from '@/lib/utils'
import { EMPLOYEE_COLORS } from '@/types'
import type { Profile, EmploymentType } from '@/types'

const employmentOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'one-shot',  label: 'Serata (one-shot)' },
]

const defaultForm = {
  name: '', email: '', password: '', employment_type: 'part-time' as EmploymentType, color: EMPLOYEE_COLORS[0],
  hourly_rate: 0,
}

export default function Dipendenti() {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees()
  // Memoizzato per evitare nuovi oggetti Date ad ogni render (consistenza con Dashboard.tsx)
  const currentMonth = useMemo(() => startOfMonth(new Date()), [])
  const { shifts } = useShifts(currentMonth)

  const [addOpen, setAddOpen]     = useState(false)
  const [editTarget, setEditTarget] = useState<Profile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)
  const [form, setForm]           = useState(defaultForm)
  const [editForm, setEditForm]   = useState<Partial<Profile>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const hoursForEmployee = (id: string) =>
    shifts.filter(s => s.employee_id === id).reduce((acc, s) => acc + s.hours, 0)

  const shiftsForEmployee = (id: string) =>
    shifts.filter(s => s.employee_id === id).length

  const payForEmployee = (emp: Profile) =>
    hoursForEmployee(emp.id) * (emp.hourly_rate ?? 0)

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) {
      setFormError('Compila tutti i campi obbligatori.')
      return
    }
    if (form.password.length < 6) {
      setFormError('La password deve essere almeno 6 caratteri.')
      return
    }
    setSubmitting(true)
    const { error } = await addEmployee(form)
    setSubmitting(false)
    if (error) { setFormError(error); return }
    setAddOpen(false)
    setForm(defaultForm)
  }

  const handleEdit = async () => {
    if (!editTarget) return
    setSubmitting(true)
    const { error } = await updateEmployee(editTarget.id, editForm)
    setSubmitting(false)
    if (error) { setFormError(error); return }
    setEditTarget(null)
    setEditForm({})
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    await deleteEmployee(deleteTarget.id)
    setSubmitting(false)
    setDeleteTarget(null)
  }

  return (
    <Layout title="Dipendenti" subtitle={`${employees.length} dipendenti attivi`}>
      <div className="space-y-5">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-cream-muted">
            <Users size={16} />
            <span>{format(currentMonth, 'MMMM yyyy', { locale: it })}</span>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={() => { setForm(defaultForm); setFormError(null); setAddOpen(true) }}>
            Aggiungi dipendente
          </Button>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map((emp, i) => {
              const hours   = hoursForEmployee(emp.id)
              const nShifts = shiftsForEmployee(emp.id)
              const pay     = payForEmployee(emp)
              return (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-wine-800 border border-wine-700/40 rounded-2xl p-5 relative overflow-hidden group"
                >
                  {/* Color accent */}
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: emp.color }} />
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10" style={{ background: emp.color }} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <Avatar name={emp.name} color={emp.color} size="lg" />
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditTarget(emp); setEditForm({ name: emp.name, employment_type: emp.employment_type, color: emp.color, hourly_rate: emp.hourly_rate }); setFormError(null) }}
                          className="p-1.5 rounded-lg hover:bg-wine-600/50 text-cream-darker hover:text-gold-400 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="p-1.5 rounded-lg hover:bg-red-900/30 text-cream-darker hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-cream mb-1">{emp.name}</h3>
                    <p className="text-xs text-cream-darker mb-3">{emp.email}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <EmploymentBadge type={emp.employment_type} />
                      {emp.hourly_rate > 0 ? (
                        <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
                          {formatCurrency(emp.hourly_rate)}/h
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-full bg-red-900/20 text-red-300 border border-red-700/30">
                          Paga non impostata
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-wine-700/30">
                      <div>
                        <p className="text-xs text-cream-darker flex items-center gap-1 mb-0.5">
                          <Clock size={10} /> Ore mese
                        </p>
                        <p className="text-sm font-semibold text-cream">{hours > 0 ? formatHours(hours) : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-cream-darker flex items-center gap-1 mb-0.5">
                          <Calendar size={10} /> Turni
                        </p>
                        <p className="text-sm font-semibold text-cream">{nShifts}</p>
                      </div>
                    </div>

                    {/* Da pagare: bar evidenziata */}
                    <div className="mt-3 -mx-5 -mb-5 px-5 py-3 bg-gradient-to-r from-gold-500/5 via-gold-500/10 to-transparent border-t border-gold-500/10">
                      <p className="text-[10px] text-cream-darker uppercase tracking-wider">Da pagare questo mese</p>
                      <p className="text-lg font-bold text-gold-400 leading-tight mt-0.5">
                        {emp.hourly_rate > 0 ? formatCurrency(pay) : '—'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* Add card */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: employees.length * 0.06 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => { setForm(defaultForm); setFormError(null); setAddOpen(true) }}
              className="border-2 border-dashed border-wine-600/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-gold-500/40 hover:bg-wine-800/50 transition-all min-h-[200px] group"
            >
              <div className="w-10 h-10 rounded-xl bg-wine-700/50 flex items-center justify-center group-hover:bg-gold-500/10 transition-colors">
                <Plus size={20} className="text-cream-darker group-hover:text-gold-500 transition-colors" />
              </div>
              <p className="text-sm text-cream-darker group-hover:text-cream-muted transition-colors">Nuovo dipendente</p>
            </motion.button>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Nuovo dipendente" size="md">
        <div className="space-y-4">
          <Input label="Nome completo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Es: Maria Rossi" />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="maria@stuzzicovinello.it" />
          <Input label="Password iniziale" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 caratteri" />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo contratto"
              value={form.employment_type}
              onChange={e => setForm(f => ({ ...f, employment_type: e.target.value as EmploymentType }))}
              options={employmentOptions}
            />
            <Input
              label="Paga oraria (€)"
              type="number"
              step="0.50"
              min="0"
              value={form.hourly_rate || ''}
              onChange={e => setForm(f => ({ ...f, hourly_rate: parseFloat(e.target.value) || 0 }))}
              placeholder="Es: 9.50"
            />
          </div>
          {/* Color picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-cream-muted uppercase tracking-wide">Colore calendario</label>
            <div className="flex gap-2 flex-wrap">
              {EMPLOYEE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <AnimatePresence>
            {formError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2">
                {formError}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-1">
            <Button variant="ghost" size="md" onClick={() => setAddOpen(false)} className="flex-1">Annulla</Button>
            <Button variant="primary" size="md" loading={submitting} onClick={handleAdd} className="flex-1">Crea dipendente</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Modifica dipendente" size="md">
        <div className="space-y-4">
          <Input label="Nome" value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo contratto"
              value={editForm.employment_type ?? 'part-time'}
              onChange={e => setEditForm(f => ({ ...f, employment_type: e.target.value as EmploymentType }))}
              options={employmentOptions}
            />
            <Input
              label="Paga oraria (€)"
              type="number"
              step="0.50"
              min="0"
              value={editForm.hourly_rate ?? ''}
              onChange={e => setEditForm(f => ({ ...f, hourly_rate: parseFloat(e.target.value) || 0 }))}
              placeholder="Es: 9.50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-cream-muted uppercase tracking-wide">Colore</label>
            <div className="flex gap-2 flex-wrap">
              {EMPLOYEE_COLORS.map(c => (
                <button key={c} onClick={() => setEditForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-transform ${editForm.color === c ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <AnimatePresence>
            {formError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2">{formError}</motion.p>}
          </AnimatePresence>
          <div className="flex gap-3 pt-1">
            <Button variant="ghost" size="md" onClick={() => setEditTarget(null)} className="flex-1">Annulla</Button>
            <Button variant="primary" size="md" loading={submitting} onClick={handleEdit} className="flex-1">Salva modifiche</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Elimina dipendente" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-cream-muted">
            Sei sicuro di voler eliminare <span className="text-cream font-medium">{deleteTarget?.name}</span>? Questa operazione è irreversibile.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" size="md" onClick={() => setDeleteTarget(null)} className="flex-1">Annulla</Button>
            <Button variant="danger" size="md" loading={submitting} onClick={handleDelete} className="flex-1">Elimina</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
