import { cn } from '@/lib/utils'
import type { EmploymentType } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'wine' | 'green' | 'blue' | 'default'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    gold:    'bg-gold-500/15 text-gold-400 border-gold-500/30',
    wine:    'bg-wine-400/15 text-wine-200 border-wine-400/30',
    green:   'bg-emerald-900/30 text-emerald-400 border-emerald-700/30',
    blue:    'bg-blue-900/30 text-blue-400 border-blue-700/30',
    default: 'bg-wine-700/40 text-cream-muted border-wine-600/30',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs border', variants[variant], className)}>
      {children}
    </span>
  )
}

const typeLabels: Record<EmploymentType, { label: string; variant: 'gold' | 'wine' | 'green' }> = {
  'full-time': { label: 'Full-time',  variant: 'green' },
  'part-time': { label: 'Part-time',  variant: 'gold'  },
  'one-shot':  { label: 'Serata',     variant: 'wine'  },
}

export function EmploymentBadge({ type }: { type: EmploymentType }) {
  const { label, variant } = typeLabels[type]
  return <Badge variant={variant}>{label}</Badge>
}
