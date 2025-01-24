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
import { useState } from "react"
import { TICKET_STATUS } from "../../types/models/ticket.types"
import type { Ticket, TicketComment, CreateTicketCommentDTO } from "../../types/models/ticket.types"
import { CommentForm } from "./comment-form"
import { CommentList } from "./comment-list"
import { TicketAttachments } from './ticket-attachments'
import { Attachment } from './ticket-attachments'
import { TicketAttachment } from '../../types/models/ticket.model'
import { toast } from 'sonner'

interface TicketDetailsProps {
  ticket?: Ticket;
  ticketId?: string;
  onStatusChange?: (status: string) => void;
  isUpdating?: boolean;
  isUserTicket?: boolean;
}

export function TicketDetails({ ticket: initialTicket, ticketId, onStatusChange, isUpdating = false }: TicketDetailsProps) {
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const queryClient = useQueryClient()

  const { data: fetchedTicket, isLoading: isLoadingTicket } = useQuery<Ticket>({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketService.getTicket(ticketId!),
    enabled: !!ticketId && !initialTicket
  })

  const ticket = initialTicket || fetchedTicket
  
  const { data: comments, isLoading: isLoadingComments } = useQuery<TicketComment[]>({
    queryKey: ['ticket-comments', ticket?.id],
    queryFn: () => ticketService.getTicketComments(ticket!.id),
    enabled: !!ticket?.id
  })

  const handleStatusChange = async (newStatus: string) => {
    try {
      onStatusChange?.(newStatus);
    } catch (error) {
      console.error('Failed to update ticket status:', error)
      toast.error('Failed to update ticket status')
    }
  }

  const handleCommentSubmit = async (data: CreateTicketCommentDTO) => {
    if (!ticket) return;
    
    try {
      setIsSubmittingComment(true)
      await ticketService.addTicketComment(data)
      await queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticket.id] })
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
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
                <DropdownMenuItem key={key} onClick={() => handleStatusChange(key)}>
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

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 font-medium">Attachments</h3>
            <TicketAttachments
              attachments={ticket.attachments.map((attachment: string | TicketAttachment) => {
                if (typeof attachment === 'string') {
                  const fileName = attachment.split('/').pop() || attachment;
                  return {
                    name: fileName,
                    path: attachment,
                    type: attachment.toLowerCase().endsWith('.jpg') || 
                          attachment.toLowerCase().endsWith('.png') || 
                          attachment.toLowerCase().endsWith('.gif') ? 'image' : 'file'
                  };
                }
                return {
                  name: attachment.file_name || 'Unknown file',
                  path: attachment.file_url || '',
                  type: attachment.file_type?.startsWith('image/') || attachment.file_url?.toLowerCase().endsWith('.jpg') || 
                        attachment.file_url?.toLowerCase().endsWith('.png') || 
                        attachment.file_url?.toLowerCase().endsWith('.gif') ? 'image' : 'file'
                } as Attachment;
              })}
            />
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
        <h3 className="font-medium">Comments</h3>
        <CommentForm
          ticketId={ticket.id}
          onSubmit={handleCommentSubmit}
          isSubmitting={isSubmittingComment}
        />
        {isLoadingComments ? (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <CommentList comments={comments || []} />
        )}
      </div>
    </div>
  )
} 