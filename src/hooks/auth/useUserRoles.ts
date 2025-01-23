/**
 * @fileoverview User roles hook for role-based access control
 * @module hooks/auth/useUserRoles
 * @description
 * A custom hook that fetches and manages user roles from Supabase.
 * Provides role information with loading and error states using React Query
 * for efficient caching and data synchronization.
 */

import { useQuery } from '@tanstack/react-query';
import { serviceClient } from '../../services/role-management.service';

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
      console.log('Fetching roles for user:', userId);
      if (!userId) return [];

      const { data, error } = await serviceClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      console.log('Role fetch result:', { data, error });

      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }

      const mappedRoles = (data || []).map((r: { role: string }) => r.role);
      console.log('Mapped roles:', mappedRoles);
      return mappedRoles;
    },
    enabled: !!userId, // Only run query if userId is provided
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2, // Retry failed requests twice
    refetchOnMount: true, // Changed to true to ensure roles are fetched
    refetchOnWindowFocus: true, // Changed to true to keep roles up to date
  });

  console.log('useUserRoles hook result:', {
    userId,
    roles,
    isLoading,
    error
  });

  return {
    roles: roles || [],
    isLoading,
    error: error as Error | null,
  };
} 