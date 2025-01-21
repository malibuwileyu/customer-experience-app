import { useQuery } from '@tanstack/react-query'
import { getTickets } from '../../services/ticket.service'
import type { Ticket } from '../../types/models/ticket.types'

interface UseTicketsOptions {
  status?: Ticket['status']
  priority?: Ticket['priority']
  assignedTo?: string
  createdBy?: string
  search?: string
}

export function useTickets(options: UseTicketsOptions = {}) {
  return useQuery<Ticket[], Error>({
    queryKey: ['tickets', options],
    queryFn: () => getTickets(options),
  })
} 