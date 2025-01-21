import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketService } from '../../services/ticket.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import type { CreateTicketDTO } from '../../types/models/ticket.types'

export function useCreateTicket() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

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
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      toast.success('Ticket created successfully')
      // Navigate to the ticket detail page
      navigate(`/tickets/${ticket.id}`)
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