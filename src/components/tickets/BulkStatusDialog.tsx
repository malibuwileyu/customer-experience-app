import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../common/dialog'
import { Button } from '../common/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/select'
import { ticketService } from '../../services/ticket.service'
import { toast } from 'sonner'
import { TICKET_STATUS } from '../../types/models/ticket.types'
import type { TicketStatus } from '../../types/models/ticket.types'

interface BulkStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  ticketIds: string[]
  onUpdate: () => void
}

export function BulkStatusDialog({ isOpen, onClose, ticketIds, onUpdate }: BulkStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>('open')

  const handleUpdate = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status')
      return
    }

    setIsLoading(true)
    try {
      await ticketService.bulkUpdateStatus(ticketIds, selectedStatus)
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
          <DialogTitle>Update Ticket Status</DialogTitle>
          <DialogDescription>
            Select a status to update {ticketIds.length} ticket{ticketIds.length === 1 ? '' : 's'} to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Select
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as TicketStatus)}
          >
            <SelectTrigger className="w-full" aria-label="Select status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TICKET_STATUS).map(([key, value]) => (
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