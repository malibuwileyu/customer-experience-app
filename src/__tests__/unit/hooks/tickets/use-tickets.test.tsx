/**
 * @fileoverview Tests for useTickets hook
 * @module hooks/__tests__/tickets/use-tickets
 */

import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTickets } from '../../../../hooks/tickets/use-tickets'
import ticketService from '../../../../services/ticket.service'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC, ReactNode } from 'react'
import type { Ticket, TicketStatus, TicketPriority } from '../../../../types/models/ticket.types'

// Mock ticket service
vi.mock('../../../../services/ticket.service', () => ({
  default: {
    getTickets: vi.fn()
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

describe('useTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch tickets without filters', async () => {
    const mockTickets: Ticket[] = [
      {
        id: 'ticket-1',
        title: 'Test Ticket 1',
        description: 'Test Description 1',
        status: 'open' as TicketStatus,
        priority: 'medium' as TicketPriority,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        created_by: 'user-1'
      },
      {
        id: 'ticket-2',
        title: 'Test Ticket 2',
        description: 'Test Description 2',
        status: 'closed' as TicketStatus,
        priority: 'high' as TicketPriority,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        created_by: 'user-2'
      }
    ]

    vi.mocked(ticketService.getTickets).mockResolvedValue({
      data: mockTickets,
      count: mockTickets.length
    })

    const { result } = renderHook(() => useTickets(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tickets).toEqual(mockTickets)
    expect(result.current.totalCount).toBe(mockTickets.length)
    expect(result.current.error).toBe(null)
  })

  it('should fetch tickets with filters', async () => {
    const filters = {
      status: 'open' as TicketStatus,
      priority: 'high' as TicketPriority
    }

    const mockTickets: Ticket[] = [
      {
        id: 'ticket-1',
        title: 'Test Ticket 1',
        description: 'Test Description 1',
        status: 'open' as TicketStatus,
        priority: 'high' as TicketPriority,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        created_by: 'user-1'
      }
    ]

    vi.mocked(ticketService.getTickets).mockResolvedValue({
      data: mockTickets,
      count: mockTickets.length
    })

    const { result } = renderHook(() => useTickets({ filters }), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tickets).toEqual(mockTickets)
    expect(result.current.totalCount).toBe(mockTickets.length)
    expect(result.current.error).toBe(null)
    expect(ticketService.getTickets).toHaveBeenCalledWith(filters)
  })

  it('should handle empty response', async () => {
    vi.mocked(ticketService.getTickets).mockResolvedValue({
      data: [],
      count: 0
    })

    const { result } = renderHook(() => useTickets(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tickets).toEqual([])
    expect(result.current.totalCount).toBe(0)
    expect(result.current.error).toBe(null)
  })

  it('should handle error state', async () => {
    const mockError = new Error('Failed to fetch tickets')

    vi.mocked(ticketService.getTickets).mockRejectedValue(mockError)

    const { result } = renderHook(() => useTickets(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tickets).toEqual([])
    expect(result.current.totalCount).toBe(0)
    expect(result.current.error).toBeTruthy()
    expect(result.current.error?.message).toBe('Failed to fetch tickets')
  })

  it('should show loading state while fetching', () => {
    vi.mocked(ticketService.getTickets).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useTickets(), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.tickets).toEqual([])
    expect(result.current.totalCount).toBe(0)
    expect(result.current.error).toBe(null)
  })
}) 