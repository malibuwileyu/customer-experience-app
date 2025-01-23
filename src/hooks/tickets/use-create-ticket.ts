import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketService } from '../../services/ticket.service'
import { toast } from 'sonner'
import type { CreateTicketDTO } from '../../types/models/ticket.types'

interface UseCreateTicketOptions {
  onSuccess?: () => void
}

export function useCreateTicket({ onSuccess }: UseCreateTicketOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTicketDTO) => {
      try {
        const ticket = await ticketService.createTicket(data)
        return ticket
      } catch (error) {
        console.error('Failed to create ticket:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      toast.success('Ticket created successfully')
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Error creating ticket:', error)
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create ticket. Please try again.'
      )
    }
  })
} 