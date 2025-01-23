/**
 * @fileoverview Hook for fetching tickets created by the current user
 * @module hooks/tickets/use-user-tickets
 */

import { useQuery } from '@tanstack/react-query'
import { ticketService, PaginatedResponse } from '../../services/ticket.service'
import type { Ticket } from '../../types/models/ticket.types'

interface UseUserTicketsOptions {
  page?: number
  pageSize?: number
}

export function useUserTickets({ page = 1, pageSize = 10 }: UseUserTicketsOptions = {}) {
  const { data, isLoading, error } = useQuery<PaginatedResponse<Ticket>, Error>({
    queryKey: ['userTickets', page, pageSize],
    queryFn: () => ticketService.getUserTickets(page, pageSize),
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