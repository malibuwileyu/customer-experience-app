/**
 * @fileoverview Tests for useTeamMembers hook
 * @module hooks/__tests__/teams/use-team-members
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTeamMembers } from '../../../../hooks/teams/use-team-members'
import { teamService } from '../../../../services/team.service'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC, ReactNode } from 'react'
import type { TeamMember } from '../../../../types/models/team.types'
import type { User } from '../../../../types/models/user.types'

// Mock team service
vi.mock('../../../../services/team.service', () => ({
  teamService: {
    getTeamMembers: vi.fn<[string], Promise<TeamMember[]>>()
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

describe('useTeamMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch team members successfully', async () => {
    const mockUser1: User = {
      id: 'user-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'team_lead'
    }

    const mockUser2: User = {
      id: 'user-2',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'agent'
    }

    const mockMembers: TeamMember[] = [
      {
        id: 'member-1',
        team_id: 'team-1',
        user_id: 'user-1',
        role: 'team_lead',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        user: mockUser1
      },
      {
        id: 'member-2',
        team_id: 'team-1',
        user_id: 'user-2',
        role: 'agent',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        user: mockUser2
      }
    ]

    vi.mocked(teamService.getTeamMembers).mockResolvedValue(mockMembers)

    const { result } = renderHook(() => useTeamMembers('team-1'), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.members).toEqual([])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.members).toEqual(mockMembers)
    expect(result.current.error).toBe(null)
    expect(teamService.getTeamMembers).toHaveBeenCalledWith('team-1')
  })

  it('should handle empty team', async () => {
    vi.mocked(teamService.getTeamMembers).mockResolvedValue([])

    const { result } = renderHook(() => useTeamMembers('team-1'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.members).toEqual([])
    expect(result.current.error).toBe(null)
    expect(teamService.getTeamMembers).toHaveBeenCalledWith('team-1')
  })

  it('should handle error state', async () => {
    const mockError = new Error('Failed to fetch team members')
    vi.mocked(teamService.getTeamMembers).mockRejectedValue(mockError)

    const { result } = renderHook(() => useTeamMembers('team-1'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.members).toEqual([])
    expect(result.current.error).toBeTruthy()
    expect(result.current.error?.message).toBe('Failed to fetch team members')
  })

  it('should show loading state while fetching', () => {
    vi.mocked(teamService.getTeamMembers).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useTeamMembers('team-1'), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.members).toEqual([])
    expect(result.current.error).toBe(null)
  })

  it('should not fetch when teamId is empty', () => {
    const { result } = renderHook(() => useTeamMembers(''), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.members).toEqual([])
    expect(result.current.error).toBe(null)
    expect(teamService.getTeamMembers).not.toHaveBeenCalled()
  })

  it('should refetch when teamId changes', async () => {
    const mockUser1: User = {
      id: 'user-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'team_lead'
    }

    const mockUser2: User = {
      id: 'user-2',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'team_lead'
    }

    const mockTeam1Members: TeamMember[] = [
      {
        id: 'member-1',
        team_id: 'team-1',
        user_id: 'user-1',
        role: 'team_lead',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        user: mockUser1
      }
    ]

    const mockTeam2Members: TeamMember[] = [
      {
        id: 'member-2',
        team_id: 'team-2',
        user_id: 'user-2',
        role: 'team_lead',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        user: mockUser2
      }
    ]

    vi.mocked(teamService.getTeamMembers)
      .mockImplementation((id) => Promise.resolve(id === 'team-1' ? mockTeam1Members : mockTeam2Members))

    const { result, rerender } = renderHook(
      ({ teamId }) => useTeamMembers(teamId),
      {
        wrapper: createWrapper(),
        initialProps: { teamId: 'team-1' }
      }
    )

    await waitFor(() => {
      expect(result.current.members).toEqual(mockTeam1Members)
    })

    rerender({ teamId: 'team-2' })

    await waitFor(() => {
      expect(result.current.members).toEqual(mockTeam2Members)
    })

    expect(teamService.getTeamMembers).toHaveBeenCalledWith('team-1')
    expect(teamService.getTeamMembers).toHaveBeenCalledWith('team-2')
  })
}) 