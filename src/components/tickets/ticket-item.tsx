'use client'

import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Card } from '../common/card'
import { Badge } from '../common/badge'
import { Button } from '../common/button'
import { Avatar, AvatarFallback } from '../common/avatar'
import { Checkbox } from '../common/checkbox'
import type { Ticket } from '../../types/models/ticket.types'

interface TicketItemProps {
  ticket: Ticket
  selected?: boolean
  onSelect?: (ticketId: string) => void
}

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

  const handleClick = (e: React.MouseEvent) => {
    // If clicking the checkbox, don't navigate
    if ((e.target as HTMLElement).closest('.checkbox-wrapper')) {
      return
    }
    navigate(`/tickets/${ticket.id}`)
  }

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="checkbox-wrapper pt-1">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onSelect?.(ticket.id)}
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
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/tickets/${ticket.id}/edit`)
          }}
        >
          Edit
        </Button>
      </div>
    </Card>
  )
} 