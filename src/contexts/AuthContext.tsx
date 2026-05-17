import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  transitioning: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  // transitioning copre il gap visivo tra signIn/signOut e il successivo render della UI corretta
  const [transitioning, setTransitioning] = useState(false)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) setProfile(data as Profile)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Chiude il transitioning una volta che la UI corretta è pronta:
  // - dopo signIn: user + profile presenti
  // - dopo signOut: nessun user
  useEffect(() => {
    if (!transitioning) return
    if ((user && profile) || (!user && !profile)) {
      const t = setTimeout(() => setTransitioning(false), 350)
      return () => clearTimeout(t)
    }
  }, [transitioning, user, profile])

  const signIn = async (email: string, password: string) => {
    setTransitioning(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setTransitioning(false)
      return { error: error.message }
    }
    return { error: null }
  }

  const signOut = async () => {
    setTransitioning(true)
    try {
      await supabase.auth.signOut()
    } catch {
      // Anche se il network call fallisce (es. offline o token già scaduto),
      // azzeriamo comunque lo stato locale per evitare schermo "incollato".
    }
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, transitioning, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider')
  return ctx
}
