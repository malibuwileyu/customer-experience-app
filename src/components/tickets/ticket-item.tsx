'use client'

import { useNavigate } from 'react-router-dom'
import { Card } from '../common/card'
import { Badge } from '../common/badge'
import { Button } from '../common/button'
import { Avatar, AvatarFallback, AvatarImage } from '../common/avatar'
import { formatDistanceToNow } from '../../utils/date'
import type { Ticket } from '../../types/models/ticket.types'

interface TicketItemProps {
  ticket: Ticket
}

export function TicketItem({ ticket }: TicketItemProps) {
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

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">{ticket.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {ticket.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {ticket.assigned_to && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={ticket.assignee?.avatar_url} />
              <AvatarFallback>
                {ticket.assignee?.name?.charAt(0) || 'U'}
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
          <span>Created {formatDistanceToNow(ticket.created_at)} ago</span>
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