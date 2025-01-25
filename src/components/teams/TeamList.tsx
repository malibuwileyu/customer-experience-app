/**
 * @fileoverview Team list component that displays all teams and handles team management
 * @module components/teams/TeamList
 */

import { useEffect, useState } from "react"
import { useToast } from "../../hooks/use-toast"
import { useAuth } from "../../hooks/auth/use-auth"
import type { Team, TeamMember } from "../../types/models/team.types"
import { teamService } from "../../services/team.service"
import { TeamCard } from "./TeamCard"
import { TeamDialog } from "./TeamDialog"
import { TeamMemberDialog } from "./TeamMemberDialog"

export function TeamList() {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const isTeamLead = teams.some(team => team.lead_id === user?.id)
  const canCreateTeam = isAdmin
  const canEditTeam = isAdmin
  const canDeleteTeam = isAdmin
  const canManageMembers = isAdmin || isTeamLead

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await teamService.getTeams()
        setTeams(teamsData)

        // Load members for each team
        const membersMap: Record<string, TeamMember[]> = {}
        await Promise.all(
          teamsData.map(async (team) => {
            const members = await teamService.getTeamMembers(team.id)
            membersMap[team.id] = members
          })
        )
        setTeamMembers(membersMap)
      } catch (error) {
        console.error('Failed to load teams:', error)
        toast.error("Failed to load teams")
      } finally {
        setIsLoading(false)
      }
    }

    loadTeams()
  }, [toast])

  const handleTeamUpdate = async () => {
    try {
      const updatedTeams = await teamService.getTeams()
      setTeams(updatedTeams)

      // Refresh members for each team
      const membersMap: Record<string, TeamMember[]> = {}
      await Promise.all(
        updatedTeams.map(async (team) => {
          const members = await teamService.getTeamMembers(team.id)
          membersMap[team.id] = members
        })
      )
      setTeamMembers(membersMap)
    } catch (error) {
      console.error('Failed to refresh teams:', error)
      toast.error("Failed to refresh teams")
    }
  }

  if (isLoading) {
    return <div>Loading teams...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
        {canCreateTeam && (
          <TeamDialog onSuccess={handleTeamUpdate} />
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const isTeamLeader = team.lead_id === user?.id
          const canEdit = canEditTeam && (isAdmin || isTeamLeader)
          const canDelete = canDeleteTeam && (isAdmin || isTeamLeader)
          const canManage = canManageMembers && (isAdmin || isTeamLeader)

          return (
            <TeamCard
              key={team.id}
              team={team}
              members={teamMembers[team.id] || []}
              onEdit={canEdit ? handleTeamUpdate : undefined}
              onDelete={canDelete ? handleTeamUpdate : undefined}
              onManageMembers={canManage ? () => {
                return (
                  <TeamMemberDialog
                    team={team}
                    onSuccess={handleTeamUpdate}
                  />
                )
              } : undefined}
            />
          )
        })}
      </div>
    </div>
  )
} 