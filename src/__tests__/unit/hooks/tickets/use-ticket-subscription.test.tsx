/**
 * @fileoverview Tests for useTicketSubscription hook
 * @module hooks/__tests__/tickets/use-ticket-subscription
 */

import React from 'react'
import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTicketSubscription } from '../../../../hooks/tickets/use-ticket-subscription'
import { supabase } from '../../../../lib/supabase'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC, ReactNode } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Mock channel type
type MockChannel = {
  on: (event: string, filter: any, callback: (payload: any) => void) => MockChannel;
  subscribe: () => MockChannel;
  unsubscribe: () => void;
}

// Mock payload type
type MockPayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: { id: string };
}

// Mock Supabase client
vi.mock('../../../../lib/supabase', () => {
  const mockChannel: MockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn()
  }

  return {
    supabase: {
      channel: vi.fn(() => mockChannel)
    }
  }
})

// Create a wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useTicketSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set up subscription on mount', () => {
    renderHook(() => useTicketSubscription(), {
      wrapper: createWrapper()
    })

    const mockChannel = vi.mocked(supabase.channel('tickets-changes'))
    expect(supabase.channel).toHaveBeenCalledWith('tickets-changes')
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tickets'
      },
      expect.any(Function)
    )
    expect(mockChannel.subscribe).toHaveBeenCalled()
  })

  it('should clean up subscription on unmount', () => {
    const { unmount } = renderHook(() => useTicketSubscription(), {
      wrapper: createWrapper()
    })

    unmount()

    const mockChannel = vi.mocked(supabase.channel('tickets-changes'))
    expect(mockChannel.unsubscribe).toHaveBeenCalled()
  })

  it('should invalidate queries on INSERT event', () => {
    const queryClient = new QueryClient()
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    let subscriptionCallback: ((payload: MockPayload) => void) | null = null
    const mockChannel = vi.mocked(supabase.channel('tickets-changes'))

    mockChannel.on.mockImplementation((event: string, filter: any, callback: (payload: MockPayload) => void) => {
      subscriptionCallback = callback
      return mockChannel
    })

    renderHook(() => useTicketSubscription(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    })

    if (!subscriptionCallback) throw new Error('Subscription callback not set')

    subscriptionCallback({
      eventType: 'INSERT',
      new: { id: 'ticket-1' }
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tickets'] })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['allTickets'] })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['ticket', 'ticket-1'] })
  })

  it('should invalidate queries on UPDATE event', () => {
    const queryClient = new QueryClient()
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    let subscriptionCallback: ((payload: MockPayload) => void) | null = null
    const mockChannel = vi.mocked(supabase.channel('tickets-changes'))

    mockChannel.on.mockImplementation((event: string, filter: any, callback: (payload: MockPayload) => void) => {
      subscriptionCallback = callback
      return mockChannel
    })

    renderHook(() => useTicketSubscription(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    })

    if (!subscriptionCallback) throw new Error('Subscription callback not set')

    subscriptionCallback({
      eventType: 'UPDATE',
      new: { id: 'ticket-1' }
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tickets'] })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['allTickets'] })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['ticket', 'ticket-1'] })
  })

  it('should invalidate queries on DELETE event', () => {
    const queryClient = new QueryClient()
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    let subscriptionCallback: ((payload: MockPayload) => void) | null = null
    const mockChannel = vi.mocked(supabase.channel('tickets-changes'))

    mockChannel.on.mockImplementation((event: string, filter: any, callback: (payload: MockPayload) => void) => {
      subscriptionCallback = callback
      return mockChannel
    })

    renderHook(() => useTicketSubscription(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    })

    if (!subscriptionCallback) throw new Error('Subscription callback not set')

    subscriptionCallback({
      eventType: 'DELETE'
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tickets'] })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['allTickets'] })
  })
}) 