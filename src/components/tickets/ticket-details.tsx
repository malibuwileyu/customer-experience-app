import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ticketService } from "../../services/ticket.service"
import { Skeleton } from "../common/skeleton"
import { Alert, AlertDescription } from "../common/alert"
import { Badge } from "../common/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../common/avatar"
import { Button } from "../common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../common/dropdown-menu"
import { format, formatDistanceToNow } from "date-fns"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { TICKET_STATUS } from "../../types/models/ticket.types"
import type { Ticket, TicketStatusHistory, TicketComment, CreateTicketCommentDTO } from "../../types/models/ticket.types"
import { CommentForm } from "./comment-form"
import { CommentList } from "./comment-list"
import { Card, CardContent, CardFooter, CardHeader } from '../common/card'
import { TicketAttachments } from './ticket-attachments'

interface TicketDetailsProps {
  ticketId: string
  isUserTicket?: boolean
}

export function TicketDetails({ ticketId, isUserTicket = false }: TicketDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const queryClient = useQueryClient()

  const { data: ticket, isLoading: isLoadingTicket, error: ticketError } = useQuery<Ticket>({
    queryKey: ['ticket', ticketId, isUserTicket],
    queryFn: async () => {
      console.log('TicketDetails fetching ticket:', {
        ticketId,
        isUserTicket,
      })
      try {
        const result = isUserTicket 
          ? await ticketService.getUserTicketDetails(ticketId) 
          : await ticketService.getTicket(ticketId)
        console.log('TicketDetails fetch result:', result)
        return result
      } catch (error) {
        console.error('TicketDetails fetch error:', error)
        throw error
      }
    }
  })

  const { data: statusHistory, isLoading: isLoadingHistory } = useQuery<TicketStatusHistory[]>({
    queryKey: ['ticket-status-history', ticketId],
    queryFn: () => ticketService.getTicketStatusHistory(ticketId),
    enabled: !!ticketId
  })

  const { data: comments, isLoading: isLoadingComments } = useQuery<TicketComment[]>({
    queryKey: ['ticket-comments', ticketId],
    queryFn: () => ticketService.getTicketComments(ticketId),
    enabled: !!ticketId
  })

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket || isUpdating) return
    
    try {
      setIsUpdating(true)
      await ticketService.updateTicketStatus(ticketId, newStatus as Ticket['status'])
      
      // Invalidate queries to refetch latest data
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      await queryClient.invalidateQueries({ queryKey: ['ticket-status-history', ticketId] })
    } catch (error) {
      console.error('Failed to update ticket status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCommentSubmit = async (data: CreateTicketCommentDTO) => {
    try {
      setIsSubmittingComment(true)
      await ticketService.addTicketComment(data)
      await queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] })
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (isLoadingTicket) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (ticketError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {ticketError instanceof Error ? ticketError.message : 'Failed to load ticket'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!ticket) {
    return (
      <Alert>
        <AlertDescription>Ticket not found</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
              {ticket.status}
            </Badge>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={ticket.created_by_user?.avatar_url || undefined} />
                <AvatarFallback>{ticket.created_by_user?.full_name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <span>{ticket.created_by_user?.full_name || 'Unknown'}</span>
            </div>
            <span>•</span>
            <span>{format(new Date(ticket.created_at), 'PPp')}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isUpdating}>
              Change Status
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(TICKET_STATUS).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                disabled={ticket.status === value}
                onClick={() => handleStatusChange(value)}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="prose max-w-none">
        <p>{ticket.description}</p>
      </div>

      {/* Attachments Section */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <TicketAttachments attachments={ticket.attachments} />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Priority</h3>
          <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'default'}>
            {ticket.priority}
          </Badge>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Team</h3>
          <p className="text-sm text-muted-foreground">
            {ticket.team?.name || 'Unassigned'}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Category</h3>
          <p className="text-sm text-muted-foreground">
            {ticket.category?.name || 'Uncategorized'}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Assigned To</h3>
          {ticket.assigned_to ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={ticket.assigned_to.avatar_url || undefined} />
                <AvatarFallback>{ticket.assigned_to.full_name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{ticket.assigned_to.full_name}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unassigned</p>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Comments</h2>
        <CommentForm
          ticketId={ticketId}
          onSubmit={handleCommentSubmit}
          isSubmitting={isSubmittingComment}
        />
        <CommentList
          comments={comments || []}
          isLoading={isLoadingComments}
        />
      </div>
    </div>
  )
} 