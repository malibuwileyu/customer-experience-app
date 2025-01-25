/**
 * @fileoverview Hook for fetching and managing teams
 * @module hooks/teams/use-teams
 * @description
 * A custom hook that provides access to team data with React Query for
 * efficient caching and data synchronization.
 */

import { useQuery } from '@tanstack/react-query'
import { teamService } from '../../services/team.service'
import type { Team } from '../../types/models/team.types'

/**
 * Hook for fetching and managing teams
 * 
 * @function useTeams
 * @returns {Object} Team data and query state
 * @property {Team[]} teams - Array of teams
 * @property {boolean} isLoading - Whether the query is loading
 * @property {Error | null} error - Any error that occurred during fetching
 * 
 * @example
 * ```tsx
 * function TeamList() {
 *   const { teams, isLoading, error } = useTeams();
 *   
 *   if (isLoading) return <div>Loading teams...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return (
 *     <div>
 *       {teams.map(team => (
 *         <TeamCard key={team.id} team={team} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTeams() {
  const { data: teams, isLoading, error } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => teamService.getTeams(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2, // Retry failed requests twice
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  return {
    teams: teams || [],
    isLoading,
    error: error as Error | null
  }
} 