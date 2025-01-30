import { createContext, useEffect, useState } from "react"
import { SupabaseClient, User, Session } from "@supabase/supabase-js"
import { Database } from "@/types/supabase"
import { supabase } from "./client"

interface SupabaseContextType {
  supabase: SupabaseClient<Database>
  user: User | null
  session: Session | null
}

export const SupabaseContext = createContext<SupabaseContextType | null>(null)

interface SupabaseProviderProps {
  children: React.ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setUser(currentSession?.user ?? null)
      setSession(currentSession)
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setUser(currentSession?.user ?? null)
      setSession(currentSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SupabaseContext.Provider value={{ supabase, user, session }}>
      {children}
    </SupabaseContext.Provider>
  )
} 