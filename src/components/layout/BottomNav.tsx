import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Calendar, Users, BarChart3, Clock,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const adminNav = [
  { to: '/dashboard',  label: 'Home',       icon: LayoutDashboard },
  { to: '/calendario', label: 'Calendario', icon: Calendar        },
  { to: '/dipendenti', label: 'Team',       icon: Users           },
  { to: '/report',     label: 'Report',     icon: BarChart3       },
]

const employeeNav = [
  { to: '/miei-turni', label: 'Turni',      icon: Clock    },
  { to: '/calendario', label: 'Calendario', icon: Calendar },
]

/**
 * Bottom navigation per viewport < lg (1024px).
 * Hit target ≥ 56px, safe-area-inset-bottom rispettato.
 * Indicator pill animata con layoutId (coerente con Sidebar desktop).
 */
export function BottomNav() {
  const { isAdmin } = useAuth()
  const location = useLocation()
  const nav = isAdmin ? adminNav : employeeNav

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-wine-900/95 backdrop-blur-xl border-t border-wine-700/50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navigazione principale"
    >
      <div className={cn(
        'grid',
        nav.length === 2 ? 'grid-cols-2' : 'grid-cols-4',
      )}>
        {nav.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-col items-center justify-center gap-1 min-h-[56px] px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 rounded-lg"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.span
                  layoutId="bottomNavPill"
                  aria-hidden
                  className="absolute inset-x-2 inset-y-1 rounded-xl bg-gradient-to-b from-wine-400/30 to-wine-500/20 border border-gold-500/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <motion.span
                animate={active ? { scale: 1.08 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="relative flex items-center justify-center"
              >
                <Icon
                  size={20}
                  className={cn(
                    'transition-colors',
                    active
                      ? 'text-gold-400 drop-shadow-[0_0_4px_rgba(201,169,110,0.7)]'
                      : 'text-cream-darker',
                  )}
                />
              </motion.span>
              <span className={cn(
                'relative text-[10px] font-medium tracking-wide transition-colors',
                active ? 'text-gold-300' : 'text-cream-darker',
              )}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
