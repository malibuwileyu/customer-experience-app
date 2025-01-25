/**
 * @fileoverview Hook for fetching all tickets in admin/agent view
 * @module hooks/tickets/use-all-tickets
 * @description
 * A custom hook that provides access to all tickets in the system, intended for
 * admin and agent views. Uses React Query for data fetching and caching.
 * This hook bypasses user-specific filters to show all tickets.
 */

import { useQuery } from '@tanstack/react-query'
import ticketService from '../../services/ticket.service'
import type { Ticket } from '../../types/models/ticket.types'

/**
 * Hook for fetching all tickets in the system
 * 
 * @function useAllTickets
 * @returns {Object} Ticket data and query state
 * @property {Ticket[]} tickets - Array of all tickets
 * @property {number} totalCount - Total number of tickets in the system
 * @property {boolean} isLoading - Whether the query is loading
 * @property {Error | null} error - Any error that occurred during fetching
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { tickets, isLoading } = useAllTickets();
 * 
 * // Using with loading state
 * function AdminTicketList() {
 *   const { tickets, isLoading, error } = useAllTickets();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return <TicketList tickets={tickets} />;
 * }
 * ```
 * 
 * @see useTickets - For user-specific ticket fetching
 */
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