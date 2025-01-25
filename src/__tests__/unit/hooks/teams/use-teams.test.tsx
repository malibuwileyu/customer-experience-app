/**
 * @fileoverview Tests for useTeams hook
 * @module hooks/__tests__/teams/use-teams
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTeams } from '../../../../hooks/teams/use-teams'
import { teamService } from '../../../../services/team.service'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC, ReactNode } from 'react'
import type { Team } from '../../../../types/models/team.types'

// Mock team service
vi.mock('../../../../services/team.service', () => ({
  teamService: {
    getTeams: vi.fn()
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

describe('useTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch teams successfully', async () => {
    const mockTeams: Team[] = [
      {
        id: 'team-1',
        name: 'Engineering',
        description: 'Engineering team',
        lead_id: 'user-1',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'team-2',
        name: 'Support',
        description: 'Support team',
        lead_id: 'user-2',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }
    ]

    vi.mocked(teamService.getTeams).mockResolvedValue(mockTeams)

    const { result } = renderHook(() => useTeams(), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.teams).toEqual([])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.teams).toEqual(mockTeams)
    expect(result.current.error).toBe(null)
  })

  it('should handle empty response', async () => {
    vi.mocked(teamService.getTeams).mockResolvedValue([])

    const { result } = renderHook(() => useTeams(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.teams).toEqual([])
    expect(result.current.error).toBe(null)
  })

  it('should handle error state', async () => {
    const mockError = new Error('Failed to fetch teams')
    vi.mocked(teamService.getTeams).mockRejectedValue(mockError)

    const { result } = renderHook(() => useTeams(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.teams).toEqual([])
    expect(result.current.error).toBeTruthy()
    expect(result.current.error?.message).toBe('Failed to fetch teams')
  })

  it('should show loading state while fetching', () => {
    vi.mocked(teamService.getTeams).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useTeams(), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.teams).toEqual([])
    expect(result.current.error).toBe(null)
  })
}) 