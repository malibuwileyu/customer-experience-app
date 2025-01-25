/**
 * @fileoverview Hook for fetching and managing user profile data
 * @module hooks/auth/use-profile
 * @description
 * A custom hook that provides access to the current user's profile data
 * with React Query for efficient caching and data synchronization.
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from './use-auth'
import type { Profile } from '../../types/auth.types'

/**
 * Hook for fetching and managing user profile data
 * 
 * @function useProfile
 * @returns {Object} Profile data and query state
 * @property {Profile | null} profile - The user's profile data
 * @property {boolean} isLoading - Whether the query is loading
 * @property {Error | null} error - Any error that occurred during fetching
 * 
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { profile, isLoading, error } = useProfile();
 *   
 *   if (isLoading) return <div>Loading profile...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!profile) return <div>No profile found</div>;
 *   
 *   return (
 *     <div>
 *       <h1>{profile.full_name}</h1>
 *       <p>Role: {profile.role}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProfile() {
  const { user } = useAuth()

  const { data: profile, isLoading, error } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user?.id, // Only run query if user is logged in
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2, // Retry failed requests twice
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  return {
    profile,
    isLoading,
    error: error as Error | null
  }
} 