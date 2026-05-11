import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Login      from '@/pages/Login'
import Dashboard  from '@/pages/Dashboard'
import Calendario from '@/pages/Calendario'
import Dipendenti from '@/pages/Dipendenti'
import Report     from '@/pages/Report'
import MieiTurni  from '@/pages/MieiTurni'

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-wine-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-cream-darker text-sm">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) return <Navigate to="/login" replace />
  if (adminOnly && profile.role !== 'admin') return <Navigate to="/miei-turni" replace />

  return <>{children}</>
}

function AppRoutes() {
  const { profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route path="/dashboard"  element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="/dipendenti" element={<ProtectedRoute adminOnly><Dipendenti /></ProtectedRoute>} />
        <Route path="/report"     element={<ProtectedRoute adminOnly><Report /></ProtectedRoute>} />

        {/* Shared routes */}
        <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />

        {/* Employee routes */}
        <Route path="/miei-turni" element={<ProtectedRoute><MieiTurni /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            profile?.role === 'admin'
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/miei-turni" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
