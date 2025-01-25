/**
 * @fileoverview Hook for fetching tickets created by the current user
 * @module hooks/tickets/use-user-tickets
 * @description
 * A custom hook that provides access to tickets created by the current user.
 * Supports pagination and uses React Query for data fetching and caching.
 * Intended for use in customer-facing views where users should only see
 * their own tickets.
 */

import { useQuery } from '@tanstack/react-query'
import { ticketService, PaginatedResponse } from '../../services/ticket.service'
import type { Ticket } from '../../types/models/ticket.types'

/**
 * Options for the useUserTickets hook
 * @interface UseUserTicketsOptions
 * @property {number} [page=1] - Current page number (1-indexed)
 * @property {number} [pageSize=10] - Number of tickets per page
 */
interface UseUserTicketsOptions {
  page?: number
  pageSize?: number
}

/**
 * Hook for fetching user-specific tickets with pagination
 * 
 * @function useUserTickets
 * @param {UseUserTicketsOptions} options - Configuration options for the hook
 * @returns {Object} Paginated ticket data and query state
 * @property {Ticket[]} tickets - Array of user's tickets for current page
 * @property {number} totalCount - Total number of user's tickets
 * @property {boolean} isLoading - Whether the query is loading
 * @property {Error | null} error - Any error that occurred during fetching
 * @property {number} currentPage - Current page number
 * @property {number} pageSize - Number of tickets per page
 * @property {number} totalPages - Total number of pages
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { tickets, isLoading } = useUserTickets();
 * 
 * // With pagination
 * const { 
 *   tickets, 
 *   currentPage,
 *   totalPages,
 *   isLoading 
 * } = useUserTickets({
 *   page: 2,
 *   pageSize: 20
 * });
 * 
 * // Usage in a component with pagination
 * function UserTicketList() {
 *   const [page, setPage] = useState(1);
 *   const { tickets, totalPages } = useUserTickets({ page });
 *   
 *   return (
 *     <div>
 *       <TicketList tickets={tickets} />
 *       <Pagination 
 *         currentPage={page}
 *         totalPages={totalPages}
 *         onPageChange={setPage}
 *       />
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see useTickets - For general ticket fetching
 * @see useAllTickets - For admin/agent ticket views
 */
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