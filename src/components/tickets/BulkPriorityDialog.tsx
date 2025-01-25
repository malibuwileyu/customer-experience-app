import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../common/dialog'
import { Button } from '../common/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/select'
import { ticketService } from '../../services/ticket.service'
import { toast } from 'sonner'
import { TICKET_PRIORITY } from '../../types/models/ticket.types'
import type { TicketPriority } from '../../types/models/ticket.types'

interface BulkPriorityDialogProps {
  isOpen: boolean
  onClose: () => void
  ticketIds: string[]
  onUpdate: () => void
}

export function BulkPriorityDialog({ isOpen, onClose, ticketIds, onUpdate }: BulkPriorityDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority>('medium')

  const handleUpdate = async () => {
    if (!selectedPriority) {
      toast.error('Please select a priority')
      return
    }

    setIsLoading(true)
    try {
      await ticketService.bulkUpdatePriority(ticketIds, selectedPriority)
      toast.success(`Successfully updated ${ticketIds.length} ticket${ticketIds.length === 1 ? '' : 's'}`)
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Failed to update tickets:', error)
      toast.error('Failed to update tickets')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Ticket Priority</DialogTitle>
          <DialogDescription>
            Select a priority to update {ticketIds.length} ticket{ticketIds.length === 1 ? '' : 's'} to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Select
            value={selectedPriority}
            onValueChange={(value) => setSelectedPriority(value as TicketPriority)}
          >
            <SelectTrigger className="w-full" aria-label="Select priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TICKET_PRIORITY).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 