import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={  { opacity: 0, scale: 0.92, y: 16  }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
            className={`relative w-full ${widths[size]} max-h-[90vh] flex flex-col bg-wine-800 border border-wine-600/50 rounded-2xl shadow-card overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-wine-700/50 flex-shrink-0">
              <h2 className="text-base font-semibold text-cream">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Chiudi"
                className="text-cream-dark hover:text-cream transition-colors p-1 rounded-lg hover:bg-wine-700 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body — scrollabile per form lunghi su viewport corte */}
            <div className="px-6 py-5 overflow-y-auto scrollbar-thin">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
