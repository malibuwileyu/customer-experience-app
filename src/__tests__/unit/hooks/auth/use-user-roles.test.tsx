/**
 * @fileoverview Tests for useUserRoles hook
 * @module hooks/__tests__/auth/use-user-roles
 */

import { FC, ReactNode } from 'react'
import { vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUserRoles } from '../../../../hooks/auth/useUserRoles'
import { supabase } from '../../../../lib/supabase'
import { describe, it, expect, beforeEach } from 'vitest'

// Mock Supabase client
vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: null
      })
    }))
  }
}))

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

describe('useUserRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('should return empty roles array when no userId is provided', async () => {
    const { result } = renderHook(() => useUserRoles(), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.roles).toEqual([])
    expect(result.current.error).toBe(null)
  })

  it('should fetch roles for a user', async () => {
    const mockRoles = ['admin', 'team_lead']

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { roles: mockRoles },
        error: null
      })
    } as any)

    const { result } = renderHook(() => useUserRoles('user1'), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.roles).toEqual(mockRoles)
    expect(result.current.error).toBe(null)
  })

  it('should handle role fetch error', async () => {
    const mockError = new Error('Failed to fetch roles')

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      })
    } as any)

    const { result } = renderHook(() => useUserRoles('user1'), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.roles).toEqual([])
    expect(result.current.error).toBe(mockError)
  })

  it('should handle null roles from database', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { roles: null },
        error: null
      })
    } as any)

    const { result } = renderHook(() => useUserRoles('user1'), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.roles).toEqual([])
    expect(result.current.error).toBe(null)
  })
}) 