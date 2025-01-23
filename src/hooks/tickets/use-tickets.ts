/**
 * @fileoverview Hook for fetching and managing tickets
 * @module hooks/tickets/use-tickets
 */

import { useQuery } from '@tanstack/react-query'
import { getTickets } from '../../services/ticket.service'
import type { Ticket, TicketFilters } from '../../types/models/ticket.types'

interface UseTicketsOptions {
  filters?: TicketFilters
  page?: number
  pageSize?: number
}

export function useTickets({ filters = {}, page = 1, pageSize = 10 }: UseTicketsOptions = {}) {
  const { data, isLoading, error } = useQuery<{ data: Ticket[], count: number }, Error>({
    queryKey: ['tickets', filters, page, pageSize],
    queryFn: () => getTickets(filters, page, pageSize),
  })

  return {
    tickets: data?.data ?? [],
    totalCount: data?.count ?? 0,
    isLoading,
    error,
    currentPage: page,
    pageSize,
    totalPages: Math.ceil((data?.count ?? 0) / pageSize)
  }
} 