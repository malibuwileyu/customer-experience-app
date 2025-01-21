'use client'

import { useState } from 'react'
import { useTickets } from '../../hooks/tickets/use-tickets'
import { TicketStatus, TicketPriority } from '../../types/models/ticket.types'
import { Card } from '../common/card'
import { Input } from '../common/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/select'
import { Button } from '../common/button'
import { Skeleton } from '../common/skeleton'
import { Alert, AlertDescription } from '../common/alert'
import { TicketItem } from './ticket-item'

type TicketFilters = {
  status?: TicketStatus
  priority?: TicketPriority
  assignedTo?: string
  search?: string
}

interface TicketListProps {
  selectedTickets?: string[]
  onSelectTicket?: (ticketId: string) => void
}

export function TicketList({ selectedTickets = [], onSelectTicket }: TicketListProps) {
  const [filters, setFilters] = useState<TicketFilters>({})
  const { data: tickets, isPending, error } = useTickets(filters)

  if (isPending) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4" data-testid="ticket-skeleton">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load tickets
        </AlertDescription>
      </Alert>
    )
  }

  if (!tickets?.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No tickets found</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search tickets..."
          className="max-w-xs"
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          aria-label="Search tickets"
        />
        
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value as TicketStatus })}
        >
          <SelectTrigger className="w-[180px]" aria-label="Filter by status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) => setFilters({ ...filters, priority: value as TicketPriority })}
        >
          <SelectTrigger className="w-[180px]" aria-label="Filter by priority">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline"
          onClick={() => setFilters({})}
        >
          Clear Filters
        </Button>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <TicketItem 
            key={ticket.id} 
            ticket={ticket} 
            selected={selectedTickets.includes(ticket.id)}
            onSelect={onSelectTicket}
          />
        ))}
      </div>
    </div>
  )
} 