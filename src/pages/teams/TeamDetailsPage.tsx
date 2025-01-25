/**
 * @fileoverview Team details page component
 * @module pages/teams/TeamDetailsPage
 */

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../../components/common/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/card"
import { Skeleton } from "../../components/common/skeleton"
import { useToast } from "../../hooks/use-toast"
import { teamService } from "../../services/team.service"
import type { Team } from "../../types/models/team.types"
import { TeamDialog } from "../../components/teams/TeamDialog"
import { TeamMemberDialog } from "../../components/teams/TeamMemberDialog"
import { DeleteTeamDialog } from "../../components/teams/DeleteTeamDialog"
import { useAuth } from "../../hooks/auth/use-auth"

export function TeamDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [team, setTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const isTeamLead = team?.lead_id === user?.id
  const canEdit = isAdmin || isTeamLead
  const canDelete = isAdmin || isTeamLead
  const canManageMembers = isAdmin || isTeamLead

  useEffect(() => {
    const loadTeam = async () => {
      try {
        if (!id) return
        const teamData = await teamService.getTeam(id)
        setTeam(teamData)
      } catch (error) {
        console.error('Failed to load team:', error)
        toast.error("Failed to load team details")
        navigate('/app/teams')
      } finally {
        setIsLoading(false)
      }
    }

    loadTeam()
  }, [id, toast, navigate])

  const handleTeamUpdate = async () => {
    if (!id) return
    try {
      const updatedTeam = await teamService.getTeam(id)
      setTeam(updatedTeam)
      toast.success("Team updated successfully")
    } catch (error) {
      console.error('Failed to refresh team:', error)
      toast.error("Failed to refresh team details")
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight">Team not found</h1>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground mt-2">{team.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/app/teams')}>
            Back to Teams
          </Button>
          {canEdit && (
            <TeamDialog 
              team={team}
              onSuccess={handleTeamUpdate}
            />
          )}
          {canDelete && (
            <DeleteTeamDialog
              team={team}
              onSuccess={() => navigate('/app/teams')}
            />
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              {canManageMembers && (
                <TeamMemberDialog
                  team={team}
                  onSuccess={handleTeamUpdate}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Team Lead */}
              {team.members?.find(member => member.user_id === team.lead_id) && (
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    <p className="font-medium">
                      {team.members.find(member => member.user_id === team.lead_id)?.user?.full_name}
                    </p>
                    <p className="text-muted-foreground">
                      {team.members.find(member => member.user_id === team.lead_id)?.user?.email}
                    </p>
                    <p className="text-muted-foreground">
                      {team.members.find(member => member.user_id === team.lead_id)?.user?.role}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Other Team Members */}
              {team.members?.filter(member => member.user_id !== team.lead_id).map((member) => (
                <div key={member.user_id} className="flex items-center justify-between">
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    <p className="font-medium">{member.user?.full_name}</p>
                    <p className="text-muted-foreground">{member.user?.email}</p>
                    <p className="text-muted-foreground">{member.user?.role}</p>
                  </div>
                  {canManageMembers && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await teamService.removeTeamMember(team.id, member.user_id)
                          handleTeamUpdate()
                          toast.success("Member removed successfully")
                        } catch (error) {
                          toast.error("Failed to remove team member")
                        }
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}

              {!team.members?.length && (
                <p className="text-muted-foreground text-center py-4">
                  No team members yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Team tickets feature coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 