import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketService } from '../../services/ticket.service'
import { toast } from 'sonner'
import type { CreateTicketDTO } from '../../types/models/ticket.types'

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTicketDTO) => ticketService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      toast.success('Ticket created successfully')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create ticket'
      )
    }
  })
} 