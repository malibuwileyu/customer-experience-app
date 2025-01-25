/**
 * @fileoverview Tests for useTeam hook
 * @module hooks/__tests__/teams/use-team
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTeam } from '../../../../hooks/teams/use-team'
import { teamService } from '../../../../services/team.service'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC, ReactNode } from 'react'
import type { Team } from '../../../../types/models/team.types'

// Mock team service
vi.mock('../../../../services/team.service', () => ({
  teamService: {
    getTeam: vi.fn<[string], Promise<Team | null>>()
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

describe('useTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch team successfully', async () => {
    const mockTeam: Team = {
      id: 'team-1',
      name: 'Engineering',
      description: 'Engineering team',
      lead_id: 'user-1',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }

    vi.mocked(teamService.getTeam).mockResolvedValue(mockTeam)

    const { result } = renderHook(() => useTeam('team-1'), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.team).toBe(null)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.team).toEqual(mockTeam)
    expect(result.current.error).toBe(null)
    expect(teamService.getTeam).toHaveBeenCalledWith('team-1')
  })

  it('should handle non-existent team', async () => {
    vi.mocked(teamService.getTeam).mockResolvedValue(null)

    const { result } = renderHook(() => useTeam('non-existent'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.team).toBe(null)
    expect(result.current.error).toBe(null)
    expect(teamService.getTeam).toHaveBeenCalledWith('non-existent')
  })

  it('should handle error state', async () => {
    const mockError = new Error('Failed to fetch team')
    vi.mocked(teamService.getTeam).mockRejectedValue(mockError)

    const { result } = renderHook(() => useTeam('team-1'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.team).toBe(null)
    expect(result.current.error).toBeTruthy()
    expect(result.current.error?.message).toBe('Failed to fetch team')
  })

  it('should show loading state while fetching', () => {
    vi.mocked(teamService.getTeam).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useTeam('team-1'), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.team).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should not fetch when teamId is empty', () => {
    const { result } = renderHook(() => useTeam(''), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.team).toBe(null)
    expect(result.current.error).toBe(null)
    expect(teamService.getTeam).not.toHaveBeenCalled()
  })

  it('should refetch when teamId changes', async () => {
    const mockTeam1: Team = {
      id: 'team-1',
      name: 'Engineering',
      description: 'Engineering team',
      lead_id: 'user-1',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }

    const mockTeam2: Team = {
      id: 'team-2',
      name: 'Support',
      description: 'Support team',
      lead_id: 'user-2',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }

    vi.mocked(teamService.getTeam)
      .mockImplementation((id) => Promise.resolve(id === 'team-1' ? mockTeam1 : mockTeam2))

    const { result, rerender } = renderHook(
      ({ teamId }) => useTeam(teamId),
      {
        wrapper: createWrapper(),
        initialProps: { teamId: 'team-1' }
      }
    )

    await waitFor(() => {
      expect(result.current.team).toEqual(mockTeam1)
    })

    rerender({ teamId: 'team-2' })

    await waitFor(() => {
      expect(result.current.team).toEqual(mockTeam2)
    })

    expect(teamService.getTeam).toHaveBeenCalledWith('team-1')
    expect(teamService.getTeam).toHaveBeenCalledWith('team-2')
  })
}) 