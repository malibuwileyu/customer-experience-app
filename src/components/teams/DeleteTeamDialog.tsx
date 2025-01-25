/**
 * @fileoverview Dialog component for confirming team deletion
 * @module components/teams/DeleteTeamDialog
 */

import { useState } from "react"
import { Button } from "../../components/common/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/common/dialog"
import { useToast } from "../../hooks/use-toast"
import { Team } from "../../types/models/team.types"
import { teamService } from "../../services/team.service"

interface DeleteTeamDialogProps {
  team: Team
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function DeleteTeamDialog({ team, onSuccess, trigger }: DeleteTeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await teamService.deleteTeam(team.id)
      toast.success("Team deleted", {
        description: "The team has been deleted successfully."
      })
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to delete team. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">Delete Team</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Team</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the team "{team.name}"? This action cannot be undone.
            All team members will be removed from the team.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 