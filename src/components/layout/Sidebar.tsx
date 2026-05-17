import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, Users, BarChart3,
  Wine, LogOut, ChevronLeft, Clock,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const adminNav = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/calendario',  label: 'Calendario',  icon: Calendar        },
  { to: '/dipendenti',  label: 'Dipendenti',  icon: Users           },
  { to: '/report',      label: 'Report',      icon: BarChart3       },
]

const employeeNav = [
  { to: '/miei-turni',  label: 'I miei turni', icon: Clock    },
  { to: '/calendario',  label: 'Calendario',   icon: Calendar },
]

export function Sidebar() {
  const { profile, isAdmin, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const nav = isAdmin ? adminNav : employeeNav

  // Logout: prima naviga al login, poi pulisce lo stato auth.
  // Navigando PRIMA, evitiamo che ProtectedRoute renderizzi un fallback "nero"
  // mentre user/profile vanno a null. Il LoadingOverlay (transitioning=true)
  // copre comunque l'intero gap di transizione.
  const handleSignOut = async () => {
    navigate('/login', { replace: true })
    await signOut()
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative hidden lg:flex flex-col h-screen bg-wine-800 border-r border-wine-700/50 overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-wine-700/30">
        <motion.div
          whileHover={{ rotate: -8, scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500/20 to-wine-400/20 border border-gold-500/40 flex items-center justify-center flex-shrink-0 shadow-glow-gold"
        >
          {/* Halo pulsante sotto al logo */}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-xl bg-gold-500/20"
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.15, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <Wine size={17} className="relative text-gold-400" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="text-gold-500 font-semibold text-sm leading-tight whitespace-nowrap font-serif">
                Stuzzico & Vinello
              </p>
              <p className="text-cream-darker text-xs whitespace-nowrap">Gestione Personale</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <NavLink key={to} to={to} className="block">
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 group',
                  active ? 'text-gold-300' : 'text-cream-dark hover:text-cream',
                )}
              >
                {/* Pill animata che scivola tra gli item attivi */}
                {active && (
                  <motion.span
                    layoutId="navPill"
                    aria-hidden
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-wine-400/30 via-wine-500/30 to-transparent border border-gold-500/30 shadow-glow-wine"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}

                {/* Hover backdrop sottile sugli inattivi */}
                {!active && (
                  <span className="absolute inset-0 rounded-xl bg-wine-700/0 group-hover:bg-wine-700/40 transition-colors" />
                )}

                <Icon
                  size={18}
                  className={cn(
                    'relative flex-shrink-0 transition-transform duration-200',
                    active && 'drop-shadow-[0_0_4px_rgba(201,169,110,0.6)]',
                    'group-hover:scale-110',
                  )}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="relative text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Bullet attivo sulla destra (solo da espanso) */}
                {active && !collapsed && (
                  <motion.span
                    layoutId="navBullet"
                    className="relative ml-auto w-1.5 h-1.5 rounded-full bg-gold-400 shadow-[0_0_6px_rgba(201,169,110,0.9)]"
                  />
                )}
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-wine-700/30 space-y-2">
        {/* User info */}
        <div className={cn('flex items-center gap-3 px-3 py-2', collapsed && 'justify-center')}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ background: '#7b2d3e33', color: '#c9a96e', border: '1.5px solid #7b2d3e55' }}
          >
            {profile?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-sm font-medium text-cream truncate">{profile?.name}</p>
                <p className="text-xs text-cream-darker capitalize">{profile?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-cream-dark hover:text-red-400 hover:bg-red-900/20 transition-all duration-200',
            collapsed && 'justify-center',
          )}
        >
          <LogOut size={16} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                Esci
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle — posizionato dentro al pannello (l'aside ha overflow-hidden) */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: collapsed ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-wine-700 border-2 border-gold-500/60 flex items-center justify-center text-gold-300 hover:text-gold-200 hover:border-gold-400 transition-colors shadow-[0_0_14px_rgba(201,169,110,0.45)] z-20"
        aria-label={collapsed ? 'Espandi sidebar' : 'Comprimi sidebar'}
      >
        <ChevronLeft size={13} strokeWidth={2.5} />
      </motion.button>
    </motion.aside>
  )
}
