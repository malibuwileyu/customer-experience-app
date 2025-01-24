import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ticketService } from "../../services/ticket.service"
import { Skeleton } from "../common/skeleton"
import { Badge } from "../common/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../common/avatar"
import { Button } from "../common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../common/dropdown-menu"
import { format } from "date-fns"
import { ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { TICKET_STATUS, type TicketStatus } from "../../types/models/ticket.types"
import type { Ticket, TicketComment } from "../../types/models/ticket.types"
import { CommentForm } from "./comment-form"
import { CommentList } from "./comment-list"
import { TicketAttachments } from './ticket-attachments'
import type { Attachment } from './ticket-attachments'
import type { TicketAttachment } from '../../types/models/ticket.model'
import { toast } from 'sonner'

interface TicketDetailsProps {
  ticket?: Ticket;
  ticketId?: string;
  onStatusChange?: (status: TicketStatus) => void;
  isUpdating?: boolean;
  isUserTicket?: boolean;
}

function normalizeAttachment(attachment: string | TicketAttachment): Attachment {
  if (typeof attachment === 'string') {
    const fileName = attachment.split('/').pop() || attachment;
    return {
      name: fileName,
      path: attachment,
      type: attachment.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? 'image' : 'file'
    };
  }
  
  return {
    name: attachment.file_name || 'Unknown file',
    path: attachment.file_url || '',
    type: attachment.file_type?.startsWith('image/') || 
          attachment.file_url?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? 'image' : 'file'
  };
}

export function TicketDetails({ ticket: initialTicket, ticketId, onStatusChange, isUpdating = false }: TicketDetailsProps) {
  const [ticket, setTicket] = useState<Ticket | undefined>(initialTicket)
  const queryClient = useQueryClient()

  const { isLoading: isLoadingTicket } = useQuery<Ticket, Error>({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketService.getTicket(ticketId!),
    enabled: !!ticketId && !initialTicket,
    gcTime: 0,
    refetchOnMount: true,
  })

  useEffect(() => {
    if (initialTicket) {
      setTicket(initialTicket)
    }
  }, [initialTicket])

  const { data: comments = [], isLoading: isLoadingComments } = useQuery<TicketComment[], Error>({
    queryKey: ['ticket-comments', ticket?.id],
    queryFn: () => ticketService.getTicketComments(ticket!.id),
    enabled: !!ticket?.id,
  })

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket) return

    try {
      const updatedTicket = await ticketService.updateTicket(ticket.id, { status })
      setTicket(updatedTicket)
      onStatusChange?.(status)
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    } catch (error) {
      console.error('Failed to update ticket status:', error)
      toast.error('Failed to update ticket status')
    }
  }

  if (isUpdating || isLoadingTicket || !ticket) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const normalizedAttachments = ticket.attachments?.map(normalizeAttachment) || null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{ticket.title}</h2>
        <div className="flex items-center gap-4">
          <Badge variant={ticket.status === 'open' ? 'default' : ticket.status === 'in_progress' ? 'secondary' : 'outline'}>
            {TICKET_STATUS[ticket.status]}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {TICKET_STATUS[ticket.status]} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(TICKET_STATUS).map(([key, value]) => (
                <DropdownMenuItem key={key} onClick={() => handleStatusChange(key as TicketStatus)}>
                  {value}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={ticket.created_by_user?.avatar_url || undefined} />
          <AvatarFallback>{ticket.created_by_user?.full_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{ticket.created_by_user?.full_name}</p>
          <p className="text-sm text-gray-500">
            Created {format(new Date(ticket.created_at), 'PPP')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700">{ticket.description}</p>

        {normalizedAttachments && normalizedAttachments.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 font-medium">Attachments</h3>
            <TicketAttachments attachments={normalizedAttachments} />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-medium">Priority</h3>
            <Badge variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'medium' ? 'secondary' : 'outline'}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </Badge>
          </div>

          {ticket.team && (
            <div>
              <h3 className="mb-2 font-medium">Team</h3>
              <p>{ticket.team.name}</p>
            </div>
          )}

          {ticket.category && (
            <div>
              <h3 className="mb-2 font-medium">Category</h3>
              <p>{ticket.category.name}</p>
            </div>
          )}

          {ticket.assigned_to && (
            <div>
              <h3 className="mb-2 font-medium">Assigned To</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={ticket.assigned_to.avatar_url || undefined} />
                  <AvatarFallback>{ticket.assigned_to.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{ticket.assigned_to.full_name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isLoadingComments ? (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <CommentList comments={comments} />
        )}
        <CommentForm 
          ticketId={ticket.id} 
          onSubmit={async (data) => {
            try {
              await ticketService.addTicketComment(data)
              queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticket.id] })
            } catch (error) {
              console.error('Failed to add comment:', error)
              toast.error('Failed to add comment')
            }
          }} 
        />
      </div>
    </div>
  )
} 