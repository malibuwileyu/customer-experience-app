import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../common/dialog'
import { Button } from '../common/button'
import { TeamSelector } from '../teams/TeamSelector'
import { ticketService } from '../../services/ticket.service'
import { toast } from 'sonner'

interface BulkAssignmentDialogProps {
  isOpen: boolean
  onClose: () => void
  ticketIds: string[]
  onAssign: () => void
}

export function BulkAssignmentDialog({ isOpen, onClose, ticketIds, onAssign }: BulkAssignmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')

  const handleAssign = async () => {
    if (!selectedTeamId) {
      toast.error('Please select a team')
      return
    }

    setIsLoading(true)
    try {
      await Promise.all(
        ticketIds.map(id => ticketService.assignTeam(id, selectedTeamId))
      )
      toast.success('Tickets assigned successfully')
      onAssign()
      onClose()
    } catch (error) {
      console.error('Failed to assign tickets:', error)
      toast.error('Failed to assign tickets')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Tickets to Team</DialogTitle>
          <DialogDescription>
            Select a team to assign {ticketIds.length} ticket{ticketIds.length === 1 ? '' : 's'} to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <TeamSelector
            value={selectedTeamId}
            onChange={setSelectedTeamId}
            placeholder="Select a team..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading}>
            {isLoading ? 'Assigning...' : 'Assign'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 