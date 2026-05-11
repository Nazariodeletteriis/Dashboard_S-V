import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, parseISO, getDaysInMonth } from 'date-fns'
import { it } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Printer, BarChart3 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { Layout } from '@/components/layout/Layout'
import { Avatar } from '@/components/ui/Avatar'
import { EmploymentBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useShifts } from '@/hooks/useShifts'
import { useEmployees } from '@/hooks/useEmployees'
import { formatHours, formatCurrency } from '@/lib/utils'

export default function Report() {
  const [currentMonth,     setCurrentMonth]     = useState(startOfMonth(new Date()))
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')

  const { shifts, loading, monthlyStats } = useShifts(currentMonth)
  const { employees }                     = useEmployees()

  const stats    = monthlyStats()
  const prevMonth = () => setCurrentMonth(m => startOfMonth(new Date(m.getFullYear(), m.getMonth() - 1)))
  const nextMonth = () => setCurrentMonth(m => startOfMonth(new Date(m.getFullYear(), m.getMonth() + 1)))

  // Filtered shifts for selected employee
  const filteredShifts = useMemo(() =>
    selectedEmployee === 'all'
      ? shifts
      : shifts.filter(s => s.employee_id === selectedEmployee),
    [shifts, selectedEmployee]
  )

  // Daily hours chart (hours per day for the month)
  const dailyData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const map = new Map<number, number>()
    filteredShifts.forEach(s => {
      const day = parseISO(s.date).getDate()
      map.set(day, (map.get(day) ?? 0) + s.hours)
    })
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day:  i + 1,
      ore:  Math.round((map.get(i + 1) ?? 0) * 10) / 10,
    }))
  }, [filteredShifts, currentMonth])

  // Employee detail for single-employee view
  const selectedEmp     = employees.find(e => e.id === selectedEmployee)
  const selectedStats   = stats.find(s => s.employee_id === selectedEmployee)
  const employeeShifts  = selectedEmployee !== 'all'
    ? filteredShifts.sort((a, b) => a.date.localeCompare(b.date))
    : []

  const handlePrint = () => window.print()

  return (
    <Layout title="Report" subtitle="Analisi ore e turni per dipendente">
      <div className="space-y-5">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
          <div className="flex gap-3">
            <select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              className="bg-wine-800 border border-wine-600/50 rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold-500/60 cursor-pointer"
            >
              <option value="all" className="bg-wine-800">Tutti i dipendenti</option>
              {employees.map(e => (
                <option key={e.id} value={e.id} className="bg-wine-800">{e.name}</option>
              ))}
            </select>
            <Button variant="secondary" size="sm" icon={<Printer size={14} />} onClick={handlePrint}>
              Stampa
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* All employees summary */}
            {selectedEmployee === 'all' && (
              <>
                {/* Monthly overview cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Totale ore',     value: formatHours(stats.reduce((a, s) => a + s.total_hours, 0)) },
                    { label: 'Totale turni',   value: stats.reduce((a, s) => a + s.shift_count, 0).toString() },
                    { label: 'Dipendenti',     value: stats.length.toString() },
                    {
                      label: 'Costo totale',
                      value: formatCurrency(stats.reduce((a, s) => a + s.total_pay, 0)),
                      highlight: true,
                    },
                  ].map(({ label, value, highlight }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`border rounded-2xl p-4 ${
                        highlight
                          ? 'bg-gradient-to-br from-gold-500/10 to-wine-800 border-gold-500/30'
                          : 'bg-wine-800 border-wine-700/40'
                      }`}
                    >
                      <p className="text-xs text-cream-darker uppercase tracking-wider mb-1">{label}</p>
                      <p className={`text-2xl font-semibold ${highlight ? 'text-gold-400' : 'text-cream'}`}>{value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Bar chart - hours per employee */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-wine-800 border border-wine-700/40 rounded-2xl p-5"
                >
                  <h3 className="text-sm font-semibold text-cream mb-4">
                    <BarChart3 size={16} className="inline mr-2 text-gold-500" />
                    Ore per dipendente
                  </h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={stats.map(s => ({ name: s.name.split(' ')[0], ore: Math.round(s.total_hours * 10) / 10, color: s.color }))} margin={{ left: -20 }}>
                      <XAxis dataKey="name" tick={{ fill: '#8b7a6b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#8b7a6b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1a0f14', border: '1px solid #3d2030', borderRadius: 12, color: '#f0e6d3' }} cursor={{ fill: 'rgba(201,169,110,0.06)' }} formatter={(v: number) => [`${v}h`, 'Ore']} />
                      <Bar dataKey="ore" radius={[6, 6, 0, 0]}>
                        {stats.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Summary table */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-wine-800 border border-wine-700/40 rounded-2xl p-5 print:shadow-none"
                >
                  <h3 className="text-sm font-semibold text-cream mb-4">Dettaglio mensile — {format(currentMonth, 'MMMM yyyy', { locale: it })}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-cream-darker uppercase tracking-wider border-b border-wine-700/30">
                          <th className="text-left pb-3 font-medium">Dipendente</th>
                          <th className="text-left pb-3 font-medium">Contratto</th>
                          <th className="text-right pb-3 font-medium">Turni</th>
                          <th className="text-right pb-3 font-medium">Ore</th>
                          <th className="text-right pb-3 font-medium">Paga/h</th>
                          <th className="text-right pb-3 font-medium">Compenso</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wine-700/20">
                        {stats.length === 0 ? (
                          <tr><td colSpan={6} className="py-8 text-center text-cream-darker">Nessun turno registrato</td></tr>
                        ) : stats.map((s, i) => {
                          const emp = employees.find(e => e.id === s.employee_id)
                          return (
                            <motion.tr key={s.employee_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.04 * i }}>
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <Avatar name={s.name} color={s.color} size="sm" />
                                  <span className="text-cream font-medium">{s.name}</span>
                                </div>
                              </td>
                              <td className="py-3">{emp && <EmploymentBadge type={emp.employment_type} />}</td>
                              <td className="py-3 text-right text-cream-muted">{s.shift_count}</td>
                              <td className="py-3 text-right font-semibold text-cream">{formatHours(s.total_hours)}</td>
                              <td className="py-3 text-right text-cream-muted">
                                {s.hourly_rate > 0 ? `${formatCurrency(s.hourly_rate)}` : '—'}
                              </td>
                              <td className="py-3 text-right font-semibold">
                                {s.hourly_rate > 0
                                  ? <span className="text-gold-400">{formatCurrency(s.total_pay)}</span>
                                  : <span className="text-cream-darker">—</span>}
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                      {stats.length > 0 && (
                        <tfoot className="border-t border-wine-600/40">
                          <tr>
                            <td colSpan={2} className="pt-3 text-xs font-medium text-cream-darker uppercase tracking-wider">Totale</td>
                            <td className="pt-3 text-right font-semibold text-cream">{stats.reduce((a, s) => a + s.shift_count, 0)}</td>
                            <td className="pt-3 text-right font-semibold text-cream">{formatHours(stats.reduce((a, s) => a + s.total_hours, 0))}</td>
                            <td />
                            <td className="pt-3 text-right font-bold text-gold-400">
                              {formatCurrency(stats.reduce((a, s) => a + s.total_pay, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </motion.div>
              </>
            )}

            {/* Single employee view */}
            {selectedEmployee !== 'all' && selectedEmp && (
              <div className="space-y-5">
                {/* Employee header */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-wine-800 border border-wine-700/40 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <Avatar name={selectedEmp.name} color={selectedEmp.color} size="xl" />
                    <div>
                      <h3 className="text-xl font-semibold text-cream">{selectedEmp.name}</h3>
                      <p className="text-sm text-cream-darker mt-0.5">{selectedEmp.email}</p>
                      <div className="mt-2"><EmploymentBadge type={selectedEmp.employment_type} /></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-wine-700/30">
                    {[
                      { label: 'Ore totali',  value: selectedStats ? formatHours(selectedStats.total_hours) : '0h', highlight: false },
                      { label: 'Turni',       value: (selectedStats?.shift_count ?? 0).toString(), highlight: false },
                      {
                        label: 'Paga oraria',
                        value: selectedEmp.hourly_rate > 0 ? formatCurrency(selectedEmp.hourly_rate) : '—',
                        highlight: false,
                      },
                      {
                        label: 'Da pagare',
                        value: selectedEmp.hourly_rate > 0 && selectedStats
                          ? formatCurrency(selectedStats.total_pay)
                          : '—',
                        highlight: true,
                      },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className="text-center">
                        <p className={`text-2xl font-semibold ${highlight ? 'text-gold-400' : 'text-cream'}`}>{value}</p>
                        <p className="text-xs text-cream-darker mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Eventuale split approvato vs in attesa */}
                  {selectedStats && selectedStats.pending_hours > 0 && selectedEmp.hourly_rate > 0 && (
                    <p className="text-xs text-cream-darker mt-3 text-center">
                      <span className="text-emerald-400">{formatCurrency(selectedStats.approved_pay)}</span> già approvato
                      {' • '}
                      <span className="text-gold-400">{formatCurrency(selectedStats.total_pay - selectedStats.approved_pay)}</span> in attesa
                    </p>
                  )}
                </motion.div>

                {/* Daily hours chart */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-wine-800 border border-wine-700/40 rounded-2xl p-5"
                >
                  <h3 className="text-sm font-semibold text-cream mb-4">Ore giornaliere — {format(currentMonth, 'MMMM', { locale: it })}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dailyData.filter(d => d.ore > 0)} margin={{ left: -20 }}>
                      <XAxis dataKey="day" tick={{ fill: '#8b7a6b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#8b7a6b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1a0f14', border: '1px solid #3d2030', borderRadius: 12, color: '#f0e6d3' }} formatter={(v: number) => [`${v}h`, 'Ore']} />
                      <Bar dataKey="ore" radius={[4, 4, 0, 0]} fill={selectedEmp.color} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Shifts detail table */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-wine-800 border border-wine-700/40 rounded-2xl p-5"
                >
                  <h3 className="text-sm font-semibold text-cream mb-4">Tutti i turni del mese</h3>
                  {employeeShifts.length === 0 ? (
                    <p className="text-center text-cream-darker py-8">Nessun turno registrato</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-cream-darker uppercase tracking-wider border-b border-wine-700/30">
                          <th className="text-left pb-3 font-medium">Data</th>
                          <th className="text-left pb-3 font-medium">Orario</th>
                          <th className="text-right pb-3 font-medium">Ore</th>
                          <th className="text-right pb-3 font-medium">€</th>
                          <th className="text-left pb-3 font-medium">Note</th>
                          <th className="text-right pb-3 font-medium">Stato</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wine-700/20">
                        {employeeShifts.map((shift, i) => {
                          const pay = shift.hours * (selectedEmp.hourly_rate ?? 0)
                          return (
                            <motion.tr
                              key={shift.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.03 }}
                            >
                              <td className="py-2.5 text-cream capitalize">
                                {format(parseISO(shift.date), 'EEE d MMM', { locale: it })}
                              </td>
                              <td className="py-2.5 text-cream-muted">{shift.start_time} – {shift.end_time}</td>
                              <td className="py-2.5 text-right font-medium text-cream">{formatHours(shift.hours)}</td>
                              <td className="py-2.5 text-right text-cream-muted">
                                {selectedEmp.hourly_rate > 0 ? formatCurrency(pay) : '—'}
                              </td>
                              <td className="py-2.5 text-cream-darker text-xs italic">{shift.notes ?? '—'}</td>
                              <td className="py-2.5 text-right">
                                <span className={`text-xs ${shift.approved ? 'text-emerald-400' : 'text-gold-400'}`}>
                                  {shift.approved ? '✓ Approvato' : '⏳ In attesa'}
                                </span>
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="border-t border-wine-600/40">
                        <tr>
                          <td colSpan={2} className="pt-3 text-xs text-cream-darker uppercase tracking-wider">Totale mese</td>
                          <td className="pt-3 text-right font-semibold text-cream">
                            {formatHours(employeeShifts.reduce((a, s) => a + s.hours, 0))}
                          </td>
                          <td className="pt-3 text-right font-bold text-gold-400">
                            {selectedEmp.hourly_rate > 0
                              ? formatCurrency(employeeShifts.reduce((a, s) => a + s.hours, 0) * selectedEmp.hourly_rate)
                              : '—'}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
