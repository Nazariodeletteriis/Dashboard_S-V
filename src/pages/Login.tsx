import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { AnimatedBackground } from '@/components/layout/AnimatedBackground'

/** Calice SVG che si riempie di bordeaux durante l'entrata. */
function WineGlass({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 80" width={size} height={size * 1.25} className="block">
      {/* Clip per la pancia del calice */}
      <defs>
        <clipPath id="glassClip">
          <path d="M16 6 C 16 30, 22 42, 32 42 C 42 42, 48 30, 48 6 Z" />
        </clipPath>
        <linearGradient id="wineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#9d3a4f" />
          <stop offset="60%"  stopColor="#7b2d3e" />
          <stop offset="100%" stopColor="#3d1622" />
        </linearGradient>
        <linearGradient id="glassRim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(201,169,110,0.95)" />
          <stop offset="100%" stopColor="rgba(201,169,110,0.35)" />
        </linearGradient>
      </defs>

      {/* Liquido — animato dall'alto in basso (sale dentro alla coppa) */}
      <g clipPath="url(#glassClip)">
        <motion.rect
          x="0"
          width="64"
          fill="url(#wineGrad)"
          initial={{ y: 42, height: 0 }}
          animate={{ y: 14, height: 30 }}
          transition={{ delay: 0.6, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Riflesso superficie del vino */}
        <motion.ellipse
          cx="32"
          cy="14"
          rx="16"
          ry="1.6"
          fill="rgba(232,197,206,0.45)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.35], y: [0, -0.5, 0] }}
          transition={{ delay: 1.4, duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </g>

      {/* Bordo calice */}
      <path
        d="M16 6 C 16 30, 22 42, 32 42 C 42 42, 48 30, 48 6"
        fill="none"
        stroke="url(#glassRim)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Stem */}
      <line x1="32" y1="42" x2="32" y2="68" stroke="url(#glassRim)" strokeWidth="1.2" />
      {/* Base */}
      <ellipse cx="32" cy="70" rx="11" ry="2.4" fill="none" stroke="url(#glassRim)" strokeWidth="1.2" />

      {/* Riflesso vetro sul lato sinistro */}
      <path
        d="M18 8 C 18 22, 22 36, 27 40"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Login() {
  const { signIn, user, profile, loading } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Parallax sui blob in base alla posizione del mouse
  const mxRaw = useMotionValue(0)
  const myRaw = useMotionValue(0)
  const mx = useSpring(mxRaw, { stiffness: 50, damping: 20 })
  const my = useSpring(myRaw, { stiffness: 50, damping: 20 })
  const blobAx = useTransform(mx, [-1, 1], [-30, 30])
  const blobAy = useTransform(my, [-1, 1], [-20, 20])
  const blobBx = useTransform(mx, [-1, 1], [25, -25])
  const blobBy = useTransform(my, [-1, 1], [15, -15])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1   // -1..1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      mxRaw.set(x)
      myRaw.set(y)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [mxRaw, myRaw])

  // redirect after login
  if (!loading && user && profile) {
    return <Navigate to={profile.role === 'admin' ? '/dashboard' : '/miei-turni'} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError('Email o password non corretti. Riprova.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-wine-gradient relative overflow-hidden flex items-center justify-center">
      {/* Sfondo animato (variante rich = più orbi + scintille) */}
      <AnimatedBackground variant="rich" />

      {/* Blob parallax — reattivi al movimento del mouse */}
      <motion.div
        aria-hidden
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-wine-400/15 rounded-full blur-3xl pointer-events-none"
        style={{ x: blobAx, y: blobAy }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold-500/12 rounded-full blur-3xl pointer-events-none"
        style={{ x: blobBx, y: blobBy }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', duration: 0.7, bounce: 0.18 }}
        className="relative z-10 w-full max-w-sm mx-4 bg-wine-800/70 backdrop-blur-2xl border border-wine-600/40 rounded-3xl shadow-card overflow-hidden"
      >
        {/* Top gold accent — animato */}
        <motion.div
          className="h-px w-full bg-gradient-to-r from-transparent via-gold-500 to-transparent"
          initial={{ opacity: 0, scaleX: 0.2 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        />

        <div className="p-6 sm:p-8">
          {/* Logo + nome */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center mb-8"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative mb-3"
            >
              {/* Halo dorato dietro al calice */}
              <motion.div
                className="absolute inset-0 -m-3 rounded-full bg-gold-500/15 blur-xl"
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.05, 0.9] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative">
                <WineGlass size={56} />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-2xl font-semibold text-cream font-serif tracking-wide"
            >
              Stuzzico <span className="text-gold-400">&amp;</span> Vinello
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-cream-darker text-xs mt-1 uppercase tracking-[0.25em]"
            >
              Gestione Personale
            </motion.p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-cream-muted uppercase tracking-wider">
                Email
              </label>
              <div className="relative group">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-darker group-focus-within:text-gold-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nome@stuzzicovinello.it"
                  required
                  className="w-full bg-wine-900/80 border border-wine-600/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-cream placeholder-cream-darker focus:outline-none focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-cream-muted uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-darker group-focus-within:text-gold-500 transition-colors" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-wine-900/80 border border-wine-600/50 rounded-xl pl-10 pr-10 py-2.5 text-sm text-cream placeholder-cream-darker focus:outline-none focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-darker hover:text-cream-muted transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-sm text-red-400 text-center bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-2.5"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full mt-2"
            >
              Accedi
            </Button>
          </motion.form>

          <p className="text-center text-xs text-cream-darker mt-6">
            Problemi di accesso? Contatta il responsabile.
          </p>
        </div>

        {/* Bottom accent */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-wine-400/40 to-transparent" />
      </motion.div>
    </div>
  )
}
