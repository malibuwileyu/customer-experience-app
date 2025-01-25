import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/card'
import { Button } from '../../components/common/button'
import { TicketList } from '../../components/tickets/ticket-list'
import { ticketService } from '../../services/ticket.service'
import { useToast } from '../../hooks/use-toast'
import { BulkStatusDialog } from '../../components/tickets/BulkStatusDialog'
import { BulkPriorityDialog } from '../../components/tickets/BulkPriorityDialog'
import { BulkAssignmentDialog } from '../../components/tickets/BulkAssignmentDialog'
import { useProfile } from '../../hooks/use-profile'

export function TicketsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { profile } = useProfile()
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showPriorityDialog, setShowPriorityDialog] = useState(false)
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false)

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    )
  }

  const handleSelectAll = (ticketIds: string[]) => {
    setSelectedTickets(ticketIds)
  }

  const handleBulkAction = async (action: 'delete' | 'status' | 'priority' | 'assign') => {
    if (action === 'delete') {
      try {
        setIsDeleting(true)
        await ticketService.bulkDeleteTickets(selectedTickets)
        toast.success(`Successfully deleted ${selectedTickets.length} ticket${selectedTickets.length === 1 ? '' : 's'}`)
        setSelectedTickets([])
      } catch (error) {
        console.error('Error deleting tickets:', error)
        toast.error('Failed to delete tickets. Please try again.')
      } finally {
        setIsDeleting(false)
      }
    } else if (action === 'status') {
      setShowStatusDialog(true)
    } else if (action === 'priority') {
      setShowPriorityDialog(true)
    } else if (action === 'assign') {
      setShowAssignmentDialog(true)
    }
  }

  const handleBulkUpdate = () => {
    setSelectedTickets([])
    // The query invalidation is handled by the real-time subscription
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <div className="flex items-center gap-4">
          {selectedTickets.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => handleBulkAction('status')}
              >
                Update Status
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkAction('priority')}
              >
                Update Priority
              </Button>
              {(profile?.role === 'admin' || profile?.role === 'team_lead') && (
                <Button
                  variant="outline"
                  onClick={() => handleBulkAction('assign')}
                >
                  Assign Team
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => handleBulkAction('delete')}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          )}
          <Button onClick={() => navigate('/tickets/new')}>
            Create Ticket
          </Button>
        </div>
      </div>

      <TicketList
        selectedTickets={selectedTickets}
        onSelectTicket={handleSelectTicket}
        onSelectAll={handleSelectAll}
        isAdminView
      />

      <BulkStatusDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        ticketIds={selectedTickets}
        onUpdate={handleBulkUpdate}
      />

      <BulkPriorityDialog
        isOpen={showPriorityDialog}
        onClose={() => setShowPriorityDialog(false)}
        ticketIds={selectedTickets}
        onUpdate={handleBulkUpdate}
      />

      <BulkAssignmentDialog
        isOpen={showAssignmentDialog}
        onClose={() => setShowAssignmentDialog(false)}
        ticketIds={selectedTickets}
        onUpdate={handleBulkUpdate}
      />
    </div>
  )
} 