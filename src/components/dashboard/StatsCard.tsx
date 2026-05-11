import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatsCardProps {
  label:    string
  value:    number
  suffix?:  string
  /** Formato visualizzato. 'currency' = € con decimali animati */
  format?:  'number' | 'currency'
  icon:     LucideIcon
  color:    'gold' | 'wine' | 'green' | 'blue'
  trend?:   { value: number; label: string }
  delay?:   number
}

const colorMap = {
  gold:  { bg: 'bg-gold-500/10',  border: 'border-gold-500/20',  icon: 'text-gold-500',   glow: 'shadow-glow-gold' },
  wine:  { bg: 'bg-wine-400/10',  border: 'border-wine-400/20',  icon: 'text-wine-200',   glow: 'shadow-glow-wine' },
  green: { bg: 'bg-emerald-900/20', border: 'border-emerald-700/20', icon: 'text-emerald-400', glow: '' },
  blue:  { bg: 'bg-blue-900/20',  border: 'border-blue-700/20',  icon: 'text-blue-400',   glow: '' },
}

function AnimatedNumber({ value, suffix, format }: { value: number; suffix?: string; format?: 'number' | 'currency' }) {
  const motionVal = useMotionValue(0)
  const spring    = useSpring(motionVal, { stiffness: 80, damping: 20 })
  const display   = useTransform(spring, v => {
    if (format === 'currency') return formatCurrency(v, true)
    if (suffix === 'h')        return `${Math.round(v)}h`
    return Math.round(v).toString()
  })

  useEffect(() => {
    motionVal.set(0)
    const controls = animate(motionVal, value, { duration: 1.2, ease: 'easeOut' })
    return controls.stop
  }, [value, motionVal])

  return <motion.span>{display}</motion.span>
}

export function StatsCard({ label, value, suffix, format, icon: Icon, color, trend, delay = 0 }: StatsCardProps) {
  const c = colorMap[color]

  // Parallax 3D — la card si inclina seguendo la posizione del mouse
  const cardRef = useRef<HTMLDivElement>(null)
  const rotateXraw = useMotionValue(0)
  const rotateYraw = useMotionValue(0)
  const rotateX    = useSpring(rotateXraw, { stiffness: 200, damping: 18 })
  const rotateY    = useSpring(rotateYraw, { stiffness: 200, damping: 18 })

  // Posizione del glow sotto al cursore (per il sheen interno)
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)
  const background = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(420px circle at ${x}% ${y}%, rgba(201,169,110,0.10), transparent 40%)`,
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width  // 0..1
    const py = (e.clientY - rect.top)  / rect.height // 0..1
    rotateYraw.set((px - 0.5) *  10)   // ±5°
    rotateXraw.set((py - 0.5) * -10)
    glowX.set(px * 100)
    glowY.set(py * 100)
  }

  const handleMouseLeave = () => {
    rotateXraw.set(0)
    rotateYraw.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -3 }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={`group bg-wine-800/70 backdrop-blur-xl border ${c.border} rounded-2xl p-5 relative overflow-hidden transition-shadow duration-300 hover:shadow-card`}
    >
      {/* Sheen che segue il mouse */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background }}
      />

      {/* Background decoration */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${c.bg} blur-xl`} />

      <div className="relative flex items-start justify-between" style={{ transform: 'translateZ(30px)' }}>
        <div>
          <p className="text-xs font-medium text-cream-darker uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-semibold text-cream mt-2">
            <AnimatedNumber value={value} suffix={suffix} format={format} />
          </p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: -8, scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}
        >
          <Icon size={20} className={c.icon} />
        </motion.div>
      </div>
    </motion.div>
  )
}
