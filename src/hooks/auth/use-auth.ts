/**
 * @fileoverview Hook for managing authentication state
 * @module hooks/auth/use-auth
 */

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import type { User } from "@supabase/supabase-js"

interface UserWithRole extends User {
  role?: string
}

export function useAuth() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Get user's role from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        setUser({
          ...session.user,
          role: profile?.role
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Get user's role from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        setUser({
          ...session.user,
          role: profile?.role
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, isLoading }
} 