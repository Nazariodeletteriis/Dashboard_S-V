import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { AnimatedBackground } from './AnimatedBackground'

interface LayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="relative flex h-screen bg-wine-gradient overflow-hidden">
      {/* Sfondo animato globale — orbi + grid + grain (fixed + pointer-events-none) */}
      <AnimatedBackground variant="subtle" />

      {/* Tutto il contenuto sta sopra al background (z-10) */}
      <div className="relative z-10 flex w-full h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={title} subtitle={subtitle} />
          <motion.main
            key={title}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 overflow-y-auto p-6 scrollbar-thin"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  )
}
