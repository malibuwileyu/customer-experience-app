/**
 * @fileoverview Tests for useUserTickets hook
 * @module hooks/__tests__/tickets/use-user-tickets
 */

import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUserTickets } from '../../../../hooks/tickets/use-user-tickets'
import ticketService from '../../../../services/ticket.service'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC, ReactNode } from 'react'
import type { Ticket, TicketStatus, TicketPriority } from '../../../../types/models/ticket.types'

// Mock ticket service
vi.mock('../../../../services/ticket.service', () => ({
  default: {
    getUserTickets: vi.fn()
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

describe('useUserTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch user tickets with default pagination', async () => {
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
        created_by: 'user-1'
      }
    ]

    vi.mocked(ticketService.getUserTickets).mockResolvedValue({
      data: mockTickets,
      count: mockTickets.length
    })

    const { result } = renderHook(() => useUserTickets(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tickets).toEqual(mockTickets)
    expect(result.current.totalCount).toBe(mockTickets.length)
    expect(result.current.error).toBe(null)
    expect(result.current.currentPage).toBe(1)
    expect(result.current.pageSize).toBe(10)
    expect(result.current.totalPages).toBe(1)
    expect(ticketService.getUserTickets).toHaveBeenCalledWith(1, 10)
  })

  it('should fetch user tickets with custom pagination', async () => {
    const page = 2
    const pageSize = 5
    const totalCount = 12

    const mockTickets: Ticket[] = [
      {
        id: 'ticket-6',
        title: 'Test Ticket 6',
        description: 'Test Description 6',
        status: 'open' as TicketStatus,
        priority: 'medium' as TicketPriority,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        created_by: 'user-1'
      }
    ]

    vi.mocked(ticketService.getUserTickets).mockResolvedValue({
      data: mockTickets,
      count: totalCount
    })

    const { result } = renderHook(() => useUserTickets({ page, pageSize }), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tickets).toEqual(mockTickets)
    expect(result.current.totalCount).toBe(totalCount)
    expect(result.current.error).toBe(null)
    expect(result.current.currentPage).toBe(page)
    expect(result.current.pageSize).toBe(pageSize)
    expect(result.current.totalPages).toBe(Math.ceil(totalCount / pageSize))
    expect(ticketService.getUserTickets).toHaveBeenCalledWith(page, pageSize)
  })

  it('should handle empty response', async () => {
    vi.mocked(ticketService.getUserTickets).mockResolvedValue({
      data: [],
      count: 0
    })

    const { result } = renderHook(() => useUserTickets(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tickets).toEqual([])
    expect(result.current.totalCount).toBe(0)
    expect(result.current.error).toBe(null)
    expect(result.current.totalPages).toBe(0)
  })

  it('should handle error state', async () => {
    const mockError = new Error('Failed to fetch user tickets')

    vi.mocked(ticketService.getUserTickets).mockRejectedValue(mockError)

    const { result } = renderHook(() => useUserTickets(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tickets).toEqual([])
    expect(result.current.totalCount).toBe(0)
    expect(result.current.error).toBeTruthy()
    expect(result.current.error?.message).toBe('Failed to fetch user tickets')
    expect(result.current.totalPages).toBe(0)
  })

  it('should show loading state while fetching', () => {
    vi.mocked(ticketService.getUserTickets).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useUserTickets(), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.tickets).toEqual([])
    expect(result.current.totalCount).toBe(0)
    expect(result.current.error).toBe(null)
    expect(result.current.totalPages).toBe(0)
  })
}) 