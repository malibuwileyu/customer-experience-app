/**
 * @fileoverview Hook for fetching a single team by ID
 * @module hooks/teams/use-team
 * @description
 * A custom hook that provides access to a single team's data with React Query for
 * efficient caching and data synchronization.
 */

import { useQuery } from '@tanstack/react-query'
import { teamService } from '../../services/team.service'
import type { Team } from '../../types/models/team.types'

/**
 * Hook for fetching a single team by ID
 * 
 * @function useTeam
 * @param {string} teamId - The ID of the team to fetch
 * @returns {Object} Team data and query state
 * @property {Team | null} team - The team data or null if not found
 * @property {boolean} isLoading - Whether the query is loading
 * @property {Error | null} error - Any error that occurred during fetching
 * 
 * @example
 * ```tsx
 * function TeamDetails({ teamId }: { teamId: string }) {
 *   const { team, isLoading, error } = useTeam(teamId);
 *   
 *   if (isLoading) return <div>Loading team...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!team) return <div>Team not found</div>;
 *   
 *   return (
 *     <div>
 *       <h1>{team.name}</h1>
 *       <p>{team.description}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTeam(teamId: string) {
  const { data: team, isLoading, error } = useQuery<Team | null>({
    queryKey: ['team', teamId],
    queryFn: () => teamService.getTeam(teamId),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2, // Retry failed requests twice
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!teamId, // Only run query if teamId is provided
  })

  return {
    team,
    isLoading,
    error: error as Error | null
  }
} 