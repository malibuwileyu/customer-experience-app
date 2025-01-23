"use client"

import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/common/badge"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/common/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/common/avatar"
import { Ticket } from "@/types/tickets"
import { ChevronRight } from "lucide-react"

interface TicketCardProps {
  ticket: Ticket
  onClick?: () => void
}

function getStatusVariant(status: string): "default" | "destructive" | "outline" | "secondary" {
  switch (status) {
    case "open":
      return "default"
    case "in_progress":
      return "secondary"
    case "resolved":
      return "outline"
    case "closed":
      return "destructive"
    default:
      return "default"
  }
}

function getPriorityVariant(priority: string): "default" | "destructive" | "outline" | "secondary" {
  switch (priority) {
    case "high":
      return "destructive"
    case "medium":
      return "secondary"
    case "low":
      return "outline"
    default:
      return "default"
  }
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-colors hover:bg-muted/50"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">{ticket.title}</p>
          <p className="text-sm text-muted-foreground">
            #{ticket.id} opened{" "}
            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Badge variant={getStatusVariant(ticket.status)}>
            {ticket.status}
          </Badge>
          <Badge variant={getPriorityVariant(ticket.priority)}>
            {ticket.priority}
          </Badge>
          {ticket.category && (
            <Badge variant="outline">{ticket.category.name}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={ticket.assigned_to?.avatar_url || undefined}
              alt={ticket.assigned_to?.full_name ?? "Unassigned"}
            />
            <AvatarFallback>
              {ticket.assigned_to?.full_name?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {ticket.assigned_to?.full_name ?? "Unassigned"}
            </p>
            <p className="text-sm text-muted-foreground">Assignee</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
} 