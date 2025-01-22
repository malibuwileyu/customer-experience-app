import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/card'
import { Button } from '../../components/common/button'
import { Checkbox } from '../../components/common/checkbox'
import { TicketList } from '../../components/tickets/ticket-list'
import { useTickets } from '../../hooks/tickets/use-tickets'

export function TicketsPage() {
  const navigate = useNavigate()
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const { data: tickets } = useTickets()

  const handleBulkAction = (action: 'delete' | 'close' | 'assign') => {
    // TODO: Implement bulk actions
    console.log(`Bulk ${action} for tickets:`, selectedTickets)
    setSelectedTickets([])
  }

  const handleSelectAll = () => {
    if (selectedTickets.length === tickets?.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(tickets?.map(t => t.id) || [])
    }
  }

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    )
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

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Quick Filters</CardTitle>
              <CardDescription>Filter tickets by common criteria</CardDescription>
            </div>
            {selectedTickets.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedTickets.length} selected
                </span>
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
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="select-all"
                checked={selectedTickets.length === tickets?.length && tickets.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm">
                Select All
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <TicketList 
        selectedTickets={selectedTickets}
        onSelectTicket={handleSelectTicket}
      />
    </div>
  )
} 