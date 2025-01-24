/**
 * @fileoverview Hook for fetching all tickets (admin/agent view)
 * @module hooks/tickets/use-all-tickets
 */

import { useQuery } from '@tanstack/react-query'
import ticketService from '../../services/ticket.service'
import type { Ticket } from '../../types/models/ticket.types'

export function useAllTickets() {
  const { data, isLoading, error } = useQuery<{ data: Ticket[], count: number }, Error>({
    queryKey: ['allTickets'],
    queryFn: () => ticketService.getAllTickets(),
  })

  return {
    tickets: data?.data ?? [],
    totalCount: data?.count ?? 0,
    isLoading,
    error
  }
} 