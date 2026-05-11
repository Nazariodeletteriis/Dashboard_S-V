import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

interface SparkleProps {
  /** Quando passa da false→true viene fatto un burst */
  trigger: boolean
  /** Numero di particelle */
  count?: number
  /** Colore particelle */
  color?: string
}

/**
 * Burst di particelle posizionato al centro del genitore (deve essere `relative`).
 * Si trigger-a passando `trigger={true}` e si autosmonta quando l'animazione finisce.
 */
export function Sparkle({ trigger, count = 12, color = '#c9a96e' }: SparkleProps) {
  // Direzioni casuali stabili
  const particles = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const angle    = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6
      const distance = 22 + Math.random() * 16
      return {
        id: i,
        x:        Math.cos(angle) * distance,
        y:        Math.sin(angle) * distance,
        size:     2 + Math.random() * 2,
        duration: 0.6 + Math.random() * 0.4,
      }
    }),
    [count],
  )

  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          key="burst"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Ring flash */}
          <motion.span
            className="absolute rounded-full border-2"
            style={{ borderColor: color }}
            initial={{ width: 0, height: 0, opacity: 0.9 }}
            animate={{ width: 56, height: 56, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
          {particles.map(p => (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{ width: p.size, height: p.size, background: color, boxShadow: `0 0 6px ${color}` }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
              transition={{ duration: p.duration, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
