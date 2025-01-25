/**
 * @fileoverview Hook for fetching and managing team members
 * @module hooks/teams/use-team-members
 * @description
 * A custom hook that provides access to team members data with React Query for
 * efficient caching and data synchronization.
 */

import { useQuery } from '@tanstack/react-query'
import { teamService } from '../../services/team.service'
import type { TeamMember } from '../../types/models/team.types'

/**
 * Hook for fetching team members
 * 
 * @function useTeamMembers
 * @param {string} teamId - The ID of the team to fetch members for
 * @returns {Object} Team members data and query state
 * @property {TeamMember[]} members - Array of team members
 * @property {boolean} isLoading - Whether the query is loading
 * @property {Error | null} error - Any error that occurred during fetching
 * 
 * @example
 * ```tsx
 * function TeamMemberList({ teamId }: { teamId: string }) {
 *   const { members, isLoading, error } = useTeamMembers(teamId);
 *   
 *   if (isLoading) return <div>Loading members...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return (
 *     <div>
 *       <h2>Team Members</h2>
 *       {members.map(member => (
 *         <TeamMemberCard key={member.id} member={member} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTeamMembers(teamId: string) {
  const { data: members, isLoading, error } = useQuery<TeamMember[]>({
    queryKey: ['team-members', teamId],
    queryFn: () => teamService.getTeamMembers(teamId),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2, // Retry failed requests twice
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!teamId, // Only run query if teamId is provided
  })

  return {
    members: members || [],
    isLoading,
    error: error as Error | null
  }
} 