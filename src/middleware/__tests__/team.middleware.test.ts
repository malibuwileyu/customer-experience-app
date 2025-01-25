/**
 * @fileoverview Team middleware test suite
 * @module middleware/__tests__/team
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { teamMiddleware } from '../team.middleware'
import { supabase } from '../../lib/supabase'
import type { NextFunction, Request, Response } from 'express'

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      eq: vi.fn()
    })),
    auth: {
      getUser: vi.fn()
    }
  }
}))

describe('Team Middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    vi.clearAllMocks()
    mockReq = {
      params: {},
      headers: {},
      body: {}
    }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }
    mockNext = vi.fn()
  })

  describe('validateTeamAccess', () => {
    it('should allow access for team member', async () => {
      const mockUser = { id: 'test-user-id' }
      const mockTeamId = 'test-team-id'
      mockReq.params = { teamId: mockTeamId }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      } as any)

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'member-1', role: 'agent' }],
              error: null
            })
          })
        })
      } as any)

      await teamMiddleware.validateTeamAccess(mockReq as Request, mockRes as Response, mockNext)
      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should deny access for non-team member', async () => {
      const mockUser = { id: 'test-user-id' }
      const mockTeamId = 'test-team-id'
      mockReq.params = { teamId: mockTeamId }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      } as any)

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      } as any)

      await teamMiddleware.validateTeamAccess(mockReq as Request, mockRes as Response, mockNext)
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle unauthenticated user', async () => {
      const mockTeamId = 'test-team-id'
      mockReq.params = { teamId: mockTeamId }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      } as any)

      await teamMiddleware.validateTeamAccess(mockReq as Request, mockRes as Response, mockNext)
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authenticated' })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('validateTeamRole', () => {
    it('should allow access for user with required role', async () => {
      const mockUser = { id: 'test-user-id' }
      const mockTeamId = 'test-team-id'
      mockReq.params = { teamId: mockTeamId }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      } as any)

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'member-1', role: 'team_lead' }],
              error: null
            })
          })
        })
      } as any)

      await teamMiddleware.validateTeamRole(['team_lead'])(mockReq as Request, mockRes as Response, mockNext)
      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should deny access for user without required role', async () => {
      const mockUser = { id: 'test-user-id' }
      const mockTeamId = 'test-team-id'
      mockReq.params = { teamId: mockTeamId }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      } as any)

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'member-1', role: 'agent' }],
              error: null
            })
          })
        })
      } as any)

      await teamMiddleware.validateTeamRole(['team_lead'])(mockReq as Request, mockRes as Response, mockNext)
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('validateTeamOperation', () => {
    it('should validate team creation payload', () => {
      mockReq.body = {
        name: 'Test Team',
        description: 'Test Description'
      }

      teamMiddleware.validateTeamOperation('create')(mockReq as Request, mockRes as Response, mockNext)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should reject invalid team creation payload', () => {
      mockReq.body = {
        description: 'Test Description'
        // Missing required 'name' field
      }

      teamMiddleware.validateTeamOperation('create')(mockReq as Request, mockRes as Response, mockNext)
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid team data' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should validate team update payload', () => {
      mockReq.body = {
        name: 'Updated Team Name'
      }

      teamMiddleware.validateTeamOperation('update')(mockReq as Request, mockRes as Response, mockNext)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should reject empty team update payload', () => {
      mockReq.body = {}

      teamMiddleware.validateTeamOperation('update')(mockReq as Request, mockRes as Response, mockNext)
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No update data provided' })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
}) 