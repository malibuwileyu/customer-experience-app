/**
 * @fileoverview Teams page component
 * @module pages/teams/TeamsPage
 */

import { useNavigate } from "react-router-dom"
import { Button } from "../../components/common/button"
import { TeamList } from "../../components/teams/TeamList"
import { useAuth } from "../../contexts/AuthContext"

export default function TeamsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canCreateTeam = user?.role === 'admin' || user?.role === 'super_admin'

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-2">
            Manage your teams and their members.
          </p>
        </div>
        {canCreateTeam && (
          <Button onClick={() => navigate('/app/teams/create')}>
            Create Team
          </Button>
        )}
      </div>

      <TeamList />
    </div>
  )
} 