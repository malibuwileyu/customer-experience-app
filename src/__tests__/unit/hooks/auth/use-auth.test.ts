/**
 * @fileoverview Tests for useAuth hook
 * @module hooks/__tests__/auth/use-auth
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '../../../../hooks/auth/use-auth'
import { supabase } from '../../../../lib/supabase'
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

// Mock Supabase client
vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      }),
      onAuthStateChange: vi.fn().mockImplementation((callback) => {
        return {
          data: { 
            subscription: { 
              id: 'sub1',
              unsubscribe: vi.fn(),
              callback: vi.fn()
            }
          },
          error: null
        }
      })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { role: 'admin' },
        error: null
      })
    }))
  }
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state and no user', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.user).toBe(null)
  })

  it('should handle authenticated session with role', async () => {
    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      role: 'admin'
    }

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: mockUser,
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          token_type: 'bearer'
        }
      },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('should handle unauthenticated session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBe(null)
  })

  it('should handle auth state changes', async () => {
    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      role: 'admin'
    }

    let authChangeCallback: ((event: AuthChangeEvent, session: Session | null) => void) | undefined

    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authChangeCallback = callback
      return {
        data: { 
          subscription: {
            id: 'sub1',
            unsubscribe: vi.fn(),
            callback: vi.fn()
          }
        },
        error: null
      }
    })

    const { result } = renderHook(() => useAuth())

    // Wait for initial session check to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Simulate auth state change
    if (authChangeCallback) {
      authChangeCallback('SIGNED_IN', {
        user: mockUser,
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer'
      } as Session)

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })
    }
  })

  it('should handle profile fetch error', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com'
    }

    // Mock session response
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser
        }
      },
      error: null
    } as any)

    // Mock profile query error
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Failed to fetch profile')
      })
    } as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual({
      ...mockUser,
      role: undefined
    })
  })
}) 