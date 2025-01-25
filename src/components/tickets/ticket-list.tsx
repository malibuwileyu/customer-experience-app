/**
 * @fileoverview Ticket list component for displaying and managing tickets with filtering and bulk selection capabilities
 * @module components/tickets/ticket-list
 * @description
 * A core component that displays a list of tickets with filtering, search, and bulk selection capabilities.
 * Supports both admin and regular user views, with real-time updates through Supabase subscriptions.
 */

'use client'

import { useState } from 'react'
import { useTickets } from '../../hooks/tickets/use-tickets'
import { useAllTickets } from '../../hooks/tickets/use-all-tickets'
import { useTicketSubscription } from '../../hooks/tickets/use-ticket-subscription'
import type { TicketFilters, TicketStatus, TicketPriority } from '../../types/models/ticket.types'
import { Card } from '../common/card'
import { Input } from '../common/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/select'
import { Button } from '../common/button'
import { Skeleton } from '../common/skeleton'
import { Alert, AlertDescription } from '../common/alert'
import { TicketItem } from './ticket-item'
import { Checkbox } from '../common/checkbox'

/**
 * Props for the TicketList component
 * @interface TicketListProps
 * @property {string[]} [selectedTickets] - Array of selected ticket IDs
 * @property {function} [onSelectTicket] - Callback when a ticket is selected
 * @property {function} [onSelectAll] - Callback when all tickets are selected/deselected
 * @property {boolean} [isAdminView] - Toggle between admin and regular user view
 */
interface TicketListProps {
  selectedTickets?: string[]
  onSelectTicket?: (ticketId: string) => void
  onSelectAll?: (ticketIds: string[]) => void
  isAdminView?: boolean
}

/**
 * TicketList component for displaying and managing tickets
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <TicketList />
 * 
 * // With bulk selection
 * <TicketList
 *   selectedTickets={selectedTickets}
 *   onSelectTicket={handleSelectTicket}
 *   onSelectAll={handleSelectAll}
 * />
 * 
 * // Admin view
 * <TicketList isAdminView={true} />
 * ```
 */
export function TicketList({ selectedTickets = [], onSelectTicket, onSelectAll, isAdminView = false }: TicketListProps) {
  // Subscribe to ticket changes
  useTicketSubscription()

  const [filters, setFilters] = useState<TicketFilters>({})
  const { tickets, isLoading, error } = isAdminView
    ? useAllTickets()
    : useTickets({ filters })

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