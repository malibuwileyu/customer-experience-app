/**
 * @fileoverview Card component for displaying team information
 * @module components/teams/TeamCard
 */

import { useNavigate } from "react-router-dom"
import { Button } from "../../components/common/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/common/card"
import { TeamMemberList } from "./TeamMemberList"
import { DeleteTeamDialog } from "./DeleteTeamDialog"
import type { Team, TeamMember } from "../../types/models/team.types"

interface TeamCardProps {
  team: Team
  members: TeamMember[]
  onEdit?: () => void
  onDelete?: () => void
  onManageMembers?: () => void
}

export function TeamCard({ team, members, onEdit, onDelete, onManageMembers }: TeamCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/app/teams/${team.id}`)
  }

  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={handleClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{team.name}</CardTitle>
            <CardDescription>{team.description}</CardDescription>
          </div>
          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <DeleteTeamDialog
                team={team}
                onSuccess={onDelete}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TeamMemberList members={members} />
      </CardContent>
      {onManageMembers && (
        <CardFooter onClick={e => e.stopPropagation()}>
          <Button
            variant="outline"
            onClick={onManageMembers}
            className="w-full"
          >
            Manage Members
          </Button>
        </CardFooter>
      )}
    </Card>
  )
} 