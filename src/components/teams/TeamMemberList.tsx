/**
 * @fileoverview Team member list component
 * @module components/teams/TeamMemberList
 */

import { Avatar, AvatarFallback, AvatarImage } from "../../components/common/avatar"
import { Badge } from "../../components/common/badge"
import { TeamMember } from "../../types/models/team.types"

interface TeamMemberListProps {
  members: TeamMember[]
}

export function TeamMemberList({ members }: TeamMemberListProps) {
  // Role display mapping
  const roleDisplay: Record<string, { label: string, variant: "default" | "secondary" | "outline" }> = {
    admin: { label: "Admin", variant: "default" },
    team_lead: { label: "Team Lead", variant: "secondary" },
    agent: { label: "Agent", variant: "outline" }
  }

  return (
    <div className="space-y-3">
      {members.map(member => (
        <div 
          key={member.id} 
          className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {member.user_id.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {member.user_id}
              </p>
            </div>
          </div>
          <Badge variant={roleDisplay[member.role]?.variant || "default"}>
            {roleDisplay[member.role]?.label || member.role}
          </Badge>
        </div>
      ))}
    </div>
  )
} 