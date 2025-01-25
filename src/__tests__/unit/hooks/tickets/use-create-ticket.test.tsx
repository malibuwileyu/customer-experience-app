/**
 * @fileoverview Tests for useCreateTicket hook
 * @module hooks/__tests__/tickets/use-create-ticket
 */

import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCreateTicket } from '../../../../hooks/tickets/use-create-ticket'
import { ticketService } from '../../../../services/ticket.service'
import { toast } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC, ReactNode } from 'react'
import type { CreateTicketDTO, Ticket, TicketStatus, TicketPriority } from '../../../../types/models/ticket.types'

// Mock dependencies
vi.mock('../../../../services/ticket.service', () => ({
  ticketService: {
    createTicket: vi.fn()
  }
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Create a wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })

  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  return Wrapper
}

describe('useCreateTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a ticket successfully', async () => {
    const mockTicketData: CreateTicketDTO = {
      title: 'Test Ticket',
      description: 'Test Description',
      priority: 'medium' as TicketPriority
    }

    const mockCreatedTicket: Ticket = {
      id: 'ticket-1',
      ...mockTicketData,
      status: 'open' as TicketStatus,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      created_by: 'user-1'
    }

    vi.mocked(ticketService.createTicket).mockResolvedValue(mockCreatedTicket)

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCreateTicket({ onSuccess }), {
      wrapper: createWrapper()
    })

    expect(result.current.isPending).toBe(false)

    result.current.mutate(mockTicketData)

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    expect(ticketService.createTicket).toHaveBeenCalledWith(mockTicketData)
    expect(toast.success).toHaveBeenCalledWith('Ticket created successfully')
    expect(onSuccess).toHaveBeenCalledWith(mockCreatedTicket)
  })

  it('should handle creation error', async () => {
    const mockError = new Error('Failed to create ticket')
    vi.mocked(ticketService.createTicket).mockRejectedValue(mockError)

    const mockTicketData: CreateTicketDTO = {
      title: 'Test Ticket',
      description: 'Test Description',
      priority: 'medium' as TicketPriority
    }

    const { result } = renderHook(() => useCreateTicket(), {
      wrapper: createWrapper()
    })

    expect(result.current.isPending).toBe(false)

    result.current.mutate(mockTicketData)

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    expect(ticketService.createTicket).toHaveBeenCalledWith(mockTicketData)
    expect(toast.error).toHaveBeenCalledWith('Failed to create ticket')
    expect(result.current.error).toBeTruthy()
  })

  it('should show loading state while creating', async () => {
    vi.mocked(ticketService.createTicket).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const mockTicketData: CreateTicketDTO = {
      title: 'Test Ticket',
      description: 'Test Description',
      priority: 'medium' as TicketPriority
    }

    const { result } = renderHook(() => useCreateTicket(), {
      wrapper: createWrapper()
    })

    expect(result.current.isPending).toBe(false)

    result.current.mutate(mockTicketData)

    expect(result.current.isPending).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('should call onSuccess callback with created ticket', async () => {
    const mockTicketData: CreateTicketDTO = {
      title: 'Test Ticket',
      description: 'Test Description',
      priority: 'medium' as TicketPriority
    }

    const mockCreatedTicket: Ticket = {
      id: 'ticket-1',
      ...mockTicketData,
      status: 'open' as TicketStatus,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      created_by: 'user-1'
    }

    vi.mocked(ticketService.createTicket).mockResolvedValue(mockCreatedTicket)

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCreateTicket({ onSuccess }), {
      wrapper: createWrapper()
    })

    result.current.mutate(mockTicketData)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockCreatedTicket)
    })
  })

  it('should invalidate tickets query on success', async () => {
    const queryClient = new QueryClient()
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const mockTicketData: CreateTicketDTO = {
      title: 'Test Ticket',
      description: 'Test Description',
      priority: 'medium' as TicketPriority
    }

    const mockCreatedTicket: Ticket = {
      id: 'ticket-1',
      ...mockTicketData,
      status: 'open' as TicketStatus,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      created_by: 'user-1'
    }

    vi.mocked(ticketService.createTicket).mockResolvedValue(mockCreatedTicket)

    const { result } = renderHook(() => useCreateTicket(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    })

    result.current.mutate(mockTicketData)

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tickets'] })
    })
  })
}) 