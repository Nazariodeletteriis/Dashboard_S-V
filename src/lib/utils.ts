import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// Formatta importi in euro con locale italiano (€ 1.234,50)
// `compact=true` toglie i decimali quando sono ,00 — utile per card sintetiche
export function formatCurrency(amount: number, compact = false): string {
  if (!isFinite(amount)) return '—'
  const opts: Intl.NumberFormatOptions = {
    style:                 'currency',
    currency:              'EUR',
    minimumFractionDigits: compact && Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }
  return new Intl.NumberFormat('it-IT', opts).format(amount)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
