/**
 * @fileoverview Create team page component
 * @module pages/teams/CreateTeamPage
 */

import { TeamDialog } from "../../components/teams/TeamDialog"
import { Button } from "../../components/common/button"
import { useNavigate } from "react-router-dom"

export function CreateTeamPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/app/teams')
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Team</h1>
          <p className="text-muted-foreground mt-2">
            Create a new team and start adding members.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      <div className="max-w-2xl">
        <TeamDialog 
          onSuccess={handleSuccess}
          trigger={
            <Button size="lg" className="w-full">
              Create Team
            </Button>
          }
        />
      </div>
    </div>
  )
} 