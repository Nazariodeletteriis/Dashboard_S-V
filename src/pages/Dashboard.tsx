import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Clock, Euro, CheckCircle, AlertCircle } from 'lucide-react'
import { format, startOfMonth, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Layout } from '@/components/layout/Layout'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Avatar } from '@/components/ui/Avatar'
import { EmploymentBadge } from '@/components/ui/Badge'
import { useShifts } from '@/hooks/useShifts'
import { useEmployees } from '@/hooks/useEmployees'
import { formatHours, formatCurrency } from '@/lib/utils'

export default function Dashboard() {
  const currentMonth  = useMemo(() => startOfMonth(new Date()), [])
  const { shifts, loading: sLoading, monthlyStats } = useShifts(currentMonth)
  const { employees, loading: eLoading }            = useEmployees()

  const stats  = monthlyStats()
  const loading = sLoading || eLoading

  // Pending approval
  const pendingShifts = useMemo(() =>
    shifts.filter(s => !s.approved),
    [shifts]
  )

  // Total hours this month
  const totalHours = useMemo(() =>
    shifts.reduce((acc, s) => acc + s.hours, 0),
    [shifts]
  )

  // Costo totale del mese (somma di tutte le ore × paga oraria di ciascun dipendente)
  const totalPay = useMemo(() =>
    stats.reduce((acc, s) => acc + s.total_pay, 0),
    [stats]
  )

  // Quanto è ancora "in attesa di approvazione" (in €)
  const pendingPay = useMemo(() =>
    stats.reduce((acc, s) => acc + (s.total_pay - s.approved_pay), 0),
    [stats]
  )

  // Chart data
  const chartData = stats.map(s => ({
    name:  s.name.split(' ')[0],
    ore:   Math.round(s.total_hours * 10) / 10,
    color: s.color,
  }))

  // Recent activity (last 5 shifts from today onward)
  const recentShifts = useMemo(() =>
    [...shifts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6),
    [shifts]
  )

  return (
    <Layout
      title="Dashboard"
      subtitle={`${format(currentMonth, 'MMMM yyyy', { locale: it })} — panoramica mensile`}
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatsCard label="Dipendenti"   value={employees.length}     icon={Users}    color="gold"  delay={0}    />
            <StatsCard label="Ore mese"     value={totalHours}           icon={Clock}    color="wine"  delay={0.08} suffix="h" />
            <StatsCard label="Costo mese"   value={totalPay}             icon={Euro}     color="gold"  delay={0.16} format="currency" />
            <StatsCard label="Da approvare" value={pendingShifts.length} icon={AlertCircle} color="blue" delay={0.24} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-wine-800 border border-wine-700/40 rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-cream mb-4">Ore per dipendente — {format(currentMonth, 'MMMM', { locale: it })}</h3>
              {chartData.length > 0 ? (
                <div className="h-[180px] sm:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: '#8b7a6b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8b7a6b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1a0f14', border: '1px solid #3d2030', borderRadius: 12, color: '#f0e6d3' }}
                      cursor={{ fill: 'rgba(201,169,110,0.06)' }}
                      formatter={(v: number) => [`${v}h`, 'Ore']}
                    />
                    <Bar dataKey="ore" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-cream-darker text-sm">
                  Nessun turno registrato questo mese
                </div>
              )}
            </motion.div>

            {/* Pending approvals */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-wine-800 border border-wine-700/40 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-cream">Da approvare</h3>
                  {pendingPay > 0 && (
                    <p className="text-xs text-gold-400/80 mt-0.5">{formatCurrency(pendingPay)} in attesa</p>
                  )}
                </div>
                {pendingShifts.length > 0 && (
                  <span className="text-xs bg-wine-400/20 text-wine-200 border border-wine-400/20 px-2 py-0.5 rounded-full">
                    {pendingShifts.length}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {pendingShifts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-2 text-cream-darker">
                    <CheckCircle size={24} className="text-emerald-500/50" />
                    <p className="text-sm">Tutto approvato</p>
                  </div>
                ) : (
                  pendingShifts.slice(0, 5).map(shift => (
                    <motion.div
                      key={shift.id}
                      whileHover={{ x: 2 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-wine-700/30 border border-wine-600/20"
                    >
                      {shift.profile && <Avatar name={shift.profile.name} color={shift.profile.color} size="sm" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-cream truncate">{shift.profile?.name}</p>
                        <p className="text-xs text-cream-darker">
                          {format(parseISO(shift.date), 'd MMM', { locale: it })} • {shift.start_time}–{shift.end_time}
                        </p>
                      </div>
                      <AlertCircle size={14} className="text-gold-500 flex-shrink-0" />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Employee monthly summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-wine-800 border border-wine-700/40 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-cream mb-4">Riepilogo dipendenti — {format(currentMonth, 'MMMM', { locale: it })}</h3>

            {/* MOBILE (< md): card list */}
            <div className="md:hidden space-y-2">
              {employees.length === 0 ? (
                <p className="text-center text-cream-darker py-6">Nessun dipendente trovato</p>
              ) : employees.map((emp, i) => {
                const empStats = stats.find(s => s.employee_id === emp.id)
                return (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.04 * i }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-wine-700/20 border border-wine-600/20"
                  >
                    <Avatar name={emp.name} color={emp.color} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cream font-medium truncate">{emp.name}</p>
                      <p className="text-xs text-cream-darker">
                        {empStats?.shift_count ?? 0} turni · {empStats ? formatHours(empStats.total_hours) : '0h'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {emp.hourly_rate > 0 && empStats
                        ? <p className="text-sm text-gold-400 font-semibold">{formatCurrency(empStats.total_pay)}</p>
                        : <p className="text-xs text-cream-darker">—</p>}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* DESKTOP (md+): tabella */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-cream-darker uppercase tracking-wider border-b border-wine-700/30">
                    <th className="text-left pb-3 font-medium">Dipendente</th>
                    <th className="text-left pb-3 font-medium">Tipo</th>
                    <th className="text-right pb-3 font-medium">Turni</th>
                    <th className="text-right pb-3 font-medium">Ore totali</th>
                    <th className="text-right pb-3 font-medium">Compenso</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-wine-700/20">
                  {employees.map((emp, i) => {
                    const empStats = stats.find(s => s.employee_id === emp.id)
                    const maxHours = Math.max(...stats.map(s => s.total_hours), 1)
                    const pct = empStats ? (empStats.total_hours / maxHours) * 100 : 0
                    return (
                      <motion.tr
                        key={emp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.05 * i }}
                        className="group"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={emp.name} color={emp.color} size="sm" />
                            <span className="text-cream font-medium">{emp.name}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <EmploymentBadge type={emp.employment_type} />
                        </td>
                        <td className="py-3 text-right text-cream-muted">
                          {empStats?.shift_count ?? 0}
                        </td>
                        <td className="py-3 text-right text-cream font-medium">
                          {empStats ? formatHours(empStats.total_hours) : '—'}
                        </td>
                        <td className="py-3 text-right">
                          {emp.hourly_rate > 0 && empStats
                            ? <span className="text-gold-400 font-semibold">{formatCurrency(empStats.total_pay)}</span>
                            : <span className="text-cream-darker">—</span>}
                        </td>
                        <td className="py-3 pl-4 w-32">
                          <div className="h-1.5 bg-wine-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: emp.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.5 + i * 0.05 }}
                            />
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
              {employees.length === 0 && (
                <p className="text-center text-cream-darker py-8">Nessun dipendente trovato</p>
              )}
            </div>
          </motion.div>

          {/* Recent shifts */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-wine-800 border border-wine-700/40 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-cream mb-4">Ultimi turni registrati</h3>
            <div className="space-y-2">
              {recentShifts.length === 0 ? (
                <p className="text-center text-cream-darker py-8">Nessun turno registrato</p>
              ) : (
                recentShifts.map((shift, i) => (
                  <motion.div
                    key={shift.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-wine-700/20 transition-colors"
                  >
                    {shift.profile && <Avatar name={shift.profile.name} color={shift.profile.color} size="sm" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cream font-medium">{shift.profile?.name}</p>
                      <p className="text-xs text-cream-darker">
                        {format(parseISO(shift.date), 'EEEE d MMMM', { locale: it })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-cream">{shift.start_time} – {shift.end_time}</p>
                      <p className="text-xs text-gold-500">{formatHours(shift.hours)}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${shift.approved ? 'bg-emerald-500' : 'bg-gold-500'}`} />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  )
}
