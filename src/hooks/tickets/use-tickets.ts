/**
 * @fileoverview Hook for fetching and managing tickets
 * @module hooks/tickets/use-tickets
 */

import { useQuery } from '@tanstack/react-query'
import ticketService from '../../services/ticket.service'
import type { Ticket, TicketFilters } from '../../types/models/ticket.types'

interface UseTicketsOptions {
  filters?: TicketFilters
}

export function useTickets({ filters = {} }: UseTicketsOptions = {}) {
  const { data, isLoading, error } = useQuery<{ data: Ticket[], count: number }, Error>({
    queryKey: ['tickets', filters],
    queryFn: () => ticketService.getTickets(filters),
  })

  return {
    tickets: data?.data ?? [],
    totalCount: data?.count ?? 0,
    isLoading,
    error
  }
} 