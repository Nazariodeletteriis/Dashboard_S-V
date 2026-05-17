import { motion, AnimatePresence } from 'framer-motion'

interface LoadingOverlayProps {
  open: boolean
  label?: string
}

export function LoadingOverlay({ open, label = 'Caricamento...' }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-wine-gradient backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 -m-3 rounded-full bg-gold-500/20 blur-xl"
                animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative w-12 h-12 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
            </div>
            <p className="text-cream-muted text-sm tracking-wide">{label}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
