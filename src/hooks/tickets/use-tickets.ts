/**
 * @fileoverview Hook for fetching and managing tickets with filtering capabilities
 * @module hooks/tickets/use-tickets
 * @description
 * A custom hook that provides access to ticket data with filtering options.
 * Uses React Query for data fetching and caching. Supports filtering by status,
 * priority, and other ticket properties.
 */

import { useQuery } from '@tanstack/react-query'
import ticketService from '../../services/ticket.service'
import type { Ticket, TicketFilters } from '../../types/models/ticket.types'

/**
 * Options for the useTickets hook
 * @interface UseTicketsOptions
 * @property {TicketFilters} [filters] - Optional filters to apply to the ticket query
 */
interface UseTicketsOptions {
  filters?: TicketFilters
}

/**
 * Hook for fetching and managing tickets
 * 
 * @function useTickets
 * @param {UseTicketsOptions} options - Configuration options for the hook
 * @returns {Object} Ticket data and query state
 * @property {Ticket[]} tickets - Array of fetched tickets
 * @property {number} totalCount - Total number of tickets matching the filters
 * @property {boolean} isLoading - Whether the query is loading
 * @property {Error | null} error - Any error that occurred during fetching
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { tickets, isLoading } = useTickets();
 * 
 * // With filters
 * const { tickets, totalCount } = useTickets({
 *   filters: {
 *     status: 'open',
 *     priority: 'high'
 *   }
 * });
 * ```
 */
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