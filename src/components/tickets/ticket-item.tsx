/**
 * @fileoverview Individual ticket display component with selection and action capabilities
 * @module components/tickets/ticket-item
 * @description
 * A card-based display component for individual tickets that shows key details including
 * title, description, status, priority, and assignment information. Supports selection
 * for bulk operations and navigation to ticket details or edit views.
 */

'use client'

import { formatDistanceToNow } from 'date-fns'
import { Card } from '../common/card'
import { Badge } from '../common/badge'
import { Button } from '../common/button'
import { Avatar, AvatarFallback } from '../common/avatar'
import { Checkbox } from '../common/checkbox'
import type { Ticket } from '../../types/models/ticket.types'
import { useNavigate } from 'react-router-dom'

/**
 * Props for the TicketItem component
 * @interface TicketItemProps
 * @property {Ticket} ticket - The ticket object to display
 * @property {boolean} [selected] - Whether the ticket is selected for bulk operations
 * @property {function} [onSelect] - Callback when ticket selection changes
 */
interface TicketItemProps {
  ticket: Ticket
  selected?: boolean
  onSelect?: (ticketId: string) => void
}

/**
 * TicketItem component for displaying individual ticket information
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <TicketItem ticket={ticket} />
 * 
 * // With selection
 * <TicketItem
 *   ticket={ticket}
 *   selected={isSelected}
 *   onSelect={handleSelect}
 * />
 * ```
 */
export function TicketItem({ ticket, selected = false, onSelect }: TicketItemProps) {
  const navigate = useNavigate()
  
  const statusColors = {
    open: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-500'
  }

  const priorityColors = {
    low: 'bg-gray-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(ticket.id)
  }

  const handleCardClick = () => {
    navigate(`/app/tickets/${ticket.id}`)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/app/tickets/${ticket.id}/edit`)
  }

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div 
            className="checkbox-wrapper pt-1" 
            onClick={handleCheckboxClick}
          >
            <Checkbox
              checked={selected}
              aria-label={`Select ticket ${ticket.id}`}
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {ticket.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ticket.assignee_id && (
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {ticket.assignee_id.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          <Badge className={statusColors[ticket.status]}>
            {ticket.status.replace('_', ' ')}
          </Badge>

          <Badge className={priorityColors[ticket.priority]}>
            {ticket.priority}
          </Badge>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>#{ticket.id.slice(0, 8)}</span>
          <span>Created {formatDistanceToNow(new Date(ticket.created_at))} ago</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleEditClick}
        >
          Edit
        </Button>
      </div>
    </Card>
  )
} 