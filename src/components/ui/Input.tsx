import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const fieldBase = 'w-full bg-wine-900 border border-wine-600/50 rounded-xl px-3 py-2.5 text-sm text-cream placeholder-cream-darker focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20 transition-all duration-200'

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-cream-muted uppercase tracking-wide">{label}</label>}
      <input className={cn(fieldBase, error && 'border-red-500/60', className)} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-cream-muted uppercase tracking-wide">{label}</label>}
      <select className={cn(fieldBase, 'cursor-pointer', error && 'border-red-500/60', className)} {...props}>
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-wine-800">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-cream-muted uppercase tracking-wide">{label}</label>}
      <textarea className={cn(fieldBase, 'resize-none', error && 'border-red-500/60', className)} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
