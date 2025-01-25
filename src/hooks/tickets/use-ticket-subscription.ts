/**
 * @fileoverview Hook for subscribing to ticket changes in real-time
 * @module hooks/tickets/use-ticket-subscription
 * @description
 * A custom hook that sets up real-time subscriptions to ticket changes using
 * Supabase's real-time capabilities. Automatically updates the React Query
 * cache when tickets are created, updated, or deleted.
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

/**
 * Hook for subscribing to real-time ticket changes
 * 
 * @function useTicketSubscription
 * @description
 * Sets up a subscription to all ticket changes in the system. When changes occur,
 * it automatically invalidates the relevant React Query cache entries to trigger
 * refetches. This ensures the UI stays in sync with the database.
 * 
 * Handles the following events:
 * - INSERT: New tickets are created
 * - UPDATE: Existing tickets are modified
 * - DELETE: Tickets are removed
 * 
 * @example
 * ```tsx
 * // Basic usage in a component
 * function TicketList() {
 *   useTicketSubscription();
 *   // ... rest of the component
 * }
 * 
 * // Usage with error handling
 * function TicketDashboard() {
 *   useTicketSubscription();
 *   const { tickets } = useTickets();
 *   
 *   return <div>{tickets.map(ticket => (
 *     <TicketItem key={ticket.id} ticket={ticket} />
 *   ))}</div>;
 * }
 * ```
 * 
 * @see useTickets - For fetching ticket data
 * @see useAllTickets - For admin/agent ticket views
 */
export function useTicketSubscription() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Subscribe to all ticket changes
    const subscription = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        (payload) => {
          console.log('Ticket change received:', payload)

          // Handle different types of changes
          switch (payload.eventType) {
            case 'DELETE':
              queryClient.invalidateQueries({ queryKey: ['tickets'] })
              queryClient.invalidateQueries({ queryKey: ['allTickets'] })
              break
            case 'INSERT':
            case 'UPDATE':
              queryClient.invalidateQueries({ queryKey: ['tickets'] })
              queryClient.invalidateQueries({ queryKey: ['allTickets'] })
              queryClient.invalidateQueries({ 
                queryKey: ['ticket', payload.new.id]
              })
              break
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])
} 