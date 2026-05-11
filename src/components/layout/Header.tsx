import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { profile } = useAuth()
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: it })

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-5 border-b border-wine-700/30 bg-wine-900/50 backdrop-blur-sm"
    >
      <div>
        <h1 className="text-xl font-semibold text-cream">{title}</h1>
        {subtitle && <p className="text-sm text-cream-dark mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm text-cream-darker capitalize hidden md:block">{today}</p>
        <button className="relative p-2 rounded-xl hover:bg-wine-700/50 text-cream-dark hover:text-cream transition-colors">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ background: '#7b2d3e33', color: '#c9a96e', border: '1.5px solid #7b2d3e55' }}
          >
            {profile?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <span className="text-sm text-cream hidden sm:block">{profile?.name}</span>
        </div>
      </div>
    </motion.header>
  )
}
