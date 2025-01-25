/**
 * @fileoverview Hook for fetching and managing users
 * @module hooks/users/use-users
 */

import { User } from "../../types/models/user.types"
import { supabase } from "../../lib/supabase"
import { useEffect, useState } from "react"

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .order("full_name")

        if (error) throw error

        setUsers((data as Profile[]).map(user => ({
          id: user.id,
          full_name: user.full_name || "",
          email: user.email || "",
          role: user.role || ""
        })))
      } catch (error) {
        console.error("Error fetching users:", error)
        setError(error as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return { users, isLoading, error }
} 