import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/card'
import { Button } from '../../components/common/button'
import { TicketList } from '../../components/tickets/ticket-list'

export function TicketsPage() {
  const navigate = useNavigate()
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])

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

  const handleBulkAction = (action: 'delete' | 'close' | 'assign') => {
    // TODO: Implement bulk actions
    console.log(`Bulk ${action} for tickets:`, selectedTickets)
    setSelectedTickets([])
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">Manage and track support tickets</p>
        </div>
        <Button onClick={() => navigate('/tickets/create')}>
          Create Ticket
        </Button>
      </div>

      {selectedTickets.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Bulk Actions</CardTitle>
                <CardDescription>
                  {selectedTickets.length} ticket{selectedTickets.length === 1 ? '' : 's'} selected
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('close')}
                >
                  Close Selected
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('assign')}
                >
                  Assign Selected
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <TicketList 
        selectedTickets={selectedTickets}
        onSelectTicket={handleSelectTicket}
        onSelectAll={handleSelectAll}
      />
    </div>
  )
} 