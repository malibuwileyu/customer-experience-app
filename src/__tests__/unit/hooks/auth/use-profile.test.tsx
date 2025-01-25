/**
 * @fileoverview Tests for useProfile hook
 * @module hooks/__tests__/auth/use-profile
 */

import React, { FC, ReactNode } from 'react'
import { vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProfile } from '../../../../hooks/auth/use-profile'
import { useAuth } from '../../../../hooks/auth/use-auth'
import { supabase } from '../../../../lib/supabase'
import { User } from '@supabase/supabase-js'

// Mock useAuth hook
vi.mock('../../../../hooks/auth/use-auth', () => ({
  useAuth: vi.fn()
}))

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

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('should return null profile when user is not authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false
    })

    const { result } = renderHook(() => useProfile(), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.profile).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should fetch profile for authenticated user', async () => {
    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    }

    const mockProfile = {
      id: mockUser.id,
      email: mockUser.email,
      full_name: 'Test User',
      role: 'admin',
      team_id: 'team1'
    }

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null
      })
    } as any)

    const { result } = renderHook(() => useProfile(), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.profile).toEqual(mockProfile)
    expect(result.current.error).toBe(null)
  })

  it('should handle profile fetch error', async () => {
    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    }

    const mockError = new Error('Failed to fetch profile')

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      })
    } as any)

    const { result } = renderHook(() => useProfile(), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.profile).toBe(null)
    expect(result.current.error).toBe(mockError)
  })

  it('should show loading state while fetching profile', async () => {
    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    }

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false
    })

    // Don't resolve the promise immediately to test loading state
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnValue(new Promise(() => {}))
    } as any)

    const { result } = renderHook(() => useProfile(), {
      wrapper: Wrapper
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.profile).toBe(null)
    expect(result.current.error).toBe(null)
  })
}) 