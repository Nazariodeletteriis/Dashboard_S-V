import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Bell, LogOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: it })

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Chiudi il dropdown se si clicca fuori o si preme Escape
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const handleSignOut = async () => {
    setMenuOpen(false)
    // Navigare PRIMA evita il flash della pagina protetta che si smonta;
    // il LoadingOverlay (transitioning) copre comunque tutto il gap.
    navigate('/login', { replace: true })
    await signOut()
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-wine-700/30 bg-wine-900/50 backdrop-blur-sm"
    >
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-semibold text-cream truncate">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-cream-dark mt-0.5 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <p className="text-sm text-cream-darker capitalize hidden md:block">{today}</p>
        <button
          className="relative p-2 rounded-xl hover:bg-wine-700/50 text-cream-dark hover:text-cream transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Notifiche"
        >
          <Bell size={18} />
        </button>

        {/* Avatar dropdown (logout) */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Menu utente"
            className="flex items-center gap-2 rounded-full p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 transition-transform active:scale-95"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ background: '#7b2d3e33', color: '#c9a96e', border: '1.5px solid #7b2d3e55' }}
            >
              {profile?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <span className="text-sm text-cream hidden sm:block">{profile?.name}</span>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                exit={{    opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-wine-800 border border-wine-600/50 shadow-card overflow-hidden z-50"
              >
                {/* Info utente */}
                <div className="px-4 py-3 border-b border-wine-700/40">
                  <p className="text-sm font-medium text-cream truncate">{profile?.name}</p>
                  <p className="text-xs text-cream-darker capitalize">{profile?.role}</p>
                </div>
                <button
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-cream-dark hover:text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={15} />
                  Esci
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}
