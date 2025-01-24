'use client'

import { useState } from 'react'
import { useTickets } from '../../hooks/tickets/use-tickets'
import { useAllTickets } from '../../hooks/tickets/use-all-tickets'
import type { TicketFilters, TicketStatus, TicketPriority } from '../../types/models/ticket.types'
import { Card } from '../common/card'
import { Input } from '../common/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/select'
import { Button } from '../common/button'
import { Skeleton } from '../common/skeleton'
import { Alert, AlertDescription } from '../common/alert'
import { TicketItem } from './ticket-item'
import { Checkbox } from '../common/checkbox'

interface TicketListProps {
  selectedTickets?: string[]
  onSelectTicket?: (ticketId: string) => void
  onSelectAll?: (ticketIds: string[]) => void
  isAdminView?: boolean
}

export function TicketList({ selectedTickets = [], onSelectTicket, onSelectAll, isAdminView = false }: TicketListProps) {
  const [filters, setFilters] = useState<TicketFilters>({})

  // Use different hooks based on view type
  const {
    tickets: filteredTickets,
    isLoading: isFilteredLoading,
    error: filteredError
  } = useTickets({ filters })

  const {
    tickets: allTickets,
    isLoading: isAllLoading,
    error: allError
  } = useAllTickets()

  // Use the appropriate data based on view type
  const tickets = isAdminView ? allTickets : filteredTickets
  const isLoading = isAdminView ? isAllLoading : isFilteredLoading
  const error = isAdminView ? allError : filteredError

  const handleSelectAll = () => {
    if (!tickets?.length || !onSelectAll) return
    
    const allTicketIds = tickets.map(ticket => ticket.id)
    const areAllSelected = allTicketIds.every(id => selectedTickets.includes(id))
    
    if (areAllSelected) {
      // Deselect all tickets on current page
      onSelectAll(selectedTickets.filter(id => !allTicketIds.includes(id)))
    } else {
      // Select all tickets on current page
      onSelectAll([...new Set([...selectedTickets, ...allTicketIds])])
    }
  }

  return (
    <div className="space-y-6">
      {!isAdminView && (
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
            onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value as TicketStatus })}
          >
            <SelectTrigger className="w-[180px]" aria-label="Filter by status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Filter by status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) => setFilters({ ...filters, priority: value === 'all' ? undefined : value as TicketPriority })}
          >
            <SelectTrigger className="w-[180px]" aria-label="Filter by priority">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Filter by priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline"
            onClick={() => {
              setFilters({
                status: undefined,
                priority: undefined,
                search: undefined
              })
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4" data-testid="ticket-skeleton">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load tickets
          </AlertDescription>
        </Alert>
      ) : !tickets?.length ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No tickets found</p>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2 pb-4">
            <Checkbox
              checked={tickets.length > 0 && tickets.every(ticket => selectedTickets.includes(ticket.id))}
              onCheckedChange={handleSelectAll}
              aria-label="Select all tickets"
            />
            <span className="text-sm text-muted-foreground">
              Select all
            </span>
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
        </>
      )}
    </div>
  )
} 