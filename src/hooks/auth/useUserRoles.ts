/**
 * @fileoverview User roles hook for role-based access control
 * @module hooks/auth/useUserRoles
 * @description
 * A custom hook that fetches and manages user roles from the profiles table.
 * Provides role information with loading and error states using React Query
 * for efficient caching and data synchronization.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

/**
 * Interface for the useUserRoles hook result
 * 
 * @interface
 * @property {string[]} roles - Array of role names assigned to the user
 * @property {boolean} isLoading - Whether the roles are currently being fetched
 * @property {Error | null} error - Any error that occurred during fetching
 */
interface UseUserRolesResult {
  roles: string[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching and managing user roles
 * 
 * Features:
 * - Automatic role fetching from Supabase
 * - Caching with configurable stale time
 * - Error handling and retry logic
 * - Loading state management
 * - Type-safe return values
 * 
 * @param {string} [userId] - Optional user ID to fetch roles for
 * @returns {UseUserRolesResult} Object containing roles, loading state, and any errors
 * 
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { user } = useAuth()
 *   const { roles, isLoading, error } = useUserRoles(user?.id)
 * 
 *   if (isLoading) return <div>Loading roles...</div>
 *   if (error) return <div>Error loading roles: {error.message}</div>
 * 
 *   return (
 *     <div>
 *       <h2>User Roles:</h2>
 *       <ul>
 *         {roles.map(role => (
 *           <li key={role}>{role}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   )
 * }
 * ```
 */
export function useUserRoles(userId?: string): UseUserRolesResult {
  const { data: roles, isLoading, error } = useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      // console.error('[DEBUG] Fetching roles for user:', userId);
      if (!userId) return [];

      // Fetch the user's role from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      // console.error('[DEBUG] Role fetch result:', { data, error });

      if (error) {
        // console.error('[DEBUG] Error fetching roles:', error);
        throw error;
      }

      // Return role as a single-element array if it exists
      return data?.role ? [data.role] : [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // Cache for 1 minute
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Log the final result
  // console.error('[DEBUG] useUserRoles final result:', {
  //   userId,
  //   roles,
  //   isLoading,
  //   error
  // });

  return {
    roles: roles || [],
    isLoading,
    error: error as Error | null,
  };
} 