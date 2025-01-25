/**
 * @fileoverview Hook for creating new tickets with mutation handling
 * @module hooks/tickets/use-create-ticket
 * @description
 * A custom hook that provides mutation functionality for creating new tickets.
 * Uses React Query's mutation capabilities for state management and cache
 * invalidation. Includes success and error handling with toast notifications.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketService } from '../../services/ticket.service'
import { toast } from 'sonner'
import type { CreateTicketDTO, Ticket } from '../../types/models/ticket.types'

/**
 * Options for the useCreateTicket hook
 * @interface UseCreateTicketOptions
 * @property {function} [onSuccess] - Optional callback when ticket creation succeeds
 */
interface UseCreateTicketOptions {
  onSuccess?: (ticket: Ticket) => void
}

/**
 * Hook for creating new tickets
 * 
 * @function useCreateTicket
 * @param {UseCreateTicketOptions} options - Configuration options for the hook
 * @returns {Object} Mutation object with create ticket functionality
 * @property {function} mutate - Function to trigger ticket creation
 * @property {function} mutateAsync - Async version of mutate
 * @property {boolean} isPending - Whether the mutation is in progress
 * @property {Error | null} error - Any error that occurred during mutation
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { mutate, isPending } = useCreateTicket();
 * 
 * // With success callback
 * const { mutateAsync } = useCreateTicket({
 *   onSuccess: (ticket) => {
 *     console.log('Created ticket:', ticket);
 *     navigate(`/tickets/${ticket.id}`);
 *   }
 * });
 * 
 * // Usage in a form
 * const handleSubmit = async (data: CreateTicketDTO) => {
 *   try {
 *     await mutateAsync(data);
 *   } catch (error) {
 *     console.error('Failed to create ticket:', error);
 *   }
 * };
 * ```
 * 
 * @throws {Error} When ticket creation fails
 */
export function useCreateTicket({ onSuccess }: UseCreateTicketOptions = {}) {
  const queryClient = useQueryClient()

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
      onSuccess?.(ticket)
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