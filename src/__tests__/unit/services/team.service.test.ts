/**
 * @fileoverview Team service test suite
 * @module services/__tests__/team
 */

import { vi } from 'vitest'

// Mock Supabase client - must be before other imports
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}))

import { describe, it, expect, beforeEach } from 'vitest'
import { teamService } from '../../../services/team.service'
import { supabase } from '../../../lib/supabase'
import { mockSupabaseClient, createChainableMock } from '../../mocks/supabase'
import type { CreateTeamDTO, AddTeamMemberDTO } from '../../../types/models/team.types'

describe('Team Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTeam', () => {
    it('should create a team successfully', async () => {
      const mockUser = { id: 'test-user-id' }
      const mockTeam: CreateTeamDTO = {
        name: 'Test Team',
        description: 'Test Description',
        lead_id: mockUser.id
      }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      } as any)

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'test-team-id', ...mockTeam },
              error: null
            })
          })
        })
      } as any)

      const result = await teamService.createTeam(mockTeam)
      expect(result).toEqual({ id: 'test-team-id', ...mockTeam })
    })

    it('should throw error when team creation fails', async () => {
      const mockUser = { id: 'test-user-id' }
      const mockTeam: CreateTeamDTO = {
        name: 'Test Team',
        description: 'Test Description',
        lead_id: mockUser.id
      }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      } as any)

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Failed to create team' }
            })
          })
        })
      } as any)

      await expect(teamService.createTeam(mockTeam)).rejects.toThrow('Failed to create team')
    })
  })

  describe('getTeam', () => {
    it('should return team when found', async () => {
      const mockTeam = {
        id: 'test-team-id',
        name: 'Test Team',
        description: 'Test Description',
        lead_id: 'test-user-id',
        created_at: '2024-01-26T00:00:00Z',
        updated_at: '2024-01-26T00:00:00Z'
      }

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTeam,
              error: null
            })
          })
        })
      } as any)

      const result = await teamService.getTeam('test-team-id')
      expect(result).toEqual(mockTeam)
    })

    it('should throw error when team not found', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Team not found' }
            })
          })
        })
      } as any)

      await expect(teamService.getTeam('non-existent-id')).rejects.toThrow('Team not found')
    })
  })

  describe('updateTeam', () => {
    it('should update team successfully', async () => {
      const mockUpdate = {
        name: 'Updated Team Name',
        description: 'Updated Description'
      }

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'test-team-id', ...mockUpdate },
                error: null
              })
            })
          })
        })
      } as any)

      const result = await teamService.updateTeam('test-team-id', mockUpdate)
      expect(result).toEqual({ id: 'test-team-id', ...mockUpdate })
    })

    it('should throw error when update fails', async () => {
      const mockUpdate = {
        name: 'Updated Team Name'
      }

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Failed to update team' }
              })
            })
          })
        })
      } as any)

      await expect(teamService.updateTeam('test-team-id', mockUpdate))
        .rejects.toThrow('Failed to update team')
    })
  })

  describe('addTeamMember', () => {
    it('should add team member successfully', async () => {
      const mockMember: AddTeamMemberDTO = {
        team_id: 'test-team-id',
        user_id: 'test-user-id',
        role: 'agent'
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'test-member-id', ...mockMember },
              error: null
            })
          })
        })
      } as any)

      const result = await teamService.addTeamMember(mockMember)
      expect(result).toEqual({ id: 'test-member-id', ...mockMember })
    })

    it('should throw error when adding member fails', async () => {
      const mockMember: AddTeamMemberDTO = {
        team_id: 'test-team-id',
        user_id: 'test-user-id',
        role: 'agent'
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Failed to add team member' }
            })
          })
        })
      } as any)

      await expect(teamService.addTeamMember(mockMember))
        .rejects.toThrow('Failed to add team member')
    })
  })

  describe('removeTeamMember', () => {
    it('should remove team member successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          })
        })
      } as any)

      await expect(teamService.removeTeamMember('test-team-id', 'test-user-id'))
        .resolves.not.toThrow()
    })

    it('should throw error when removal fails', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: { message: 'Failed to remove team member' }
            })
          })
        })
      } as any)

      await expect(teamService.removeTeamMember('test-team-id', 'test-user-id'))
        .rejects.toThrow('Failed to remove team member')
    })
  })

  describe('getTeamMembers', () => {
    it('should return team members when found', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          team_id: 'test-team-id',
          user_id: 'user-1',
          role: 'agent',
          created_at: '2024-01-26T00:00:00Z',
          updated_at: '2024-01-26T00:00:00Z'
        },
        {
          id: 'member-2',
          team_id: 'test-team-id',
          user_id: 'user-2',
          role: 'team_lead',
          created_at: '2024-01-26T00:00:00Z',
          updated_at: '2024-01-26T00:00:00Z'
        }
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockMembers,
            error: null
          })
        })
      } as any)

      const result = await teamService.getTeamMembers('test-team-id')
      expect(result).toEqual(mockMembers)
    })

    it('should return empty array when no members found', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      } as any)

      const result = await teamService.getTeamMembers('test-team-id')
      expect(result).toEqual([])
    })
  })
}) 