import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { supabase } from '../../lib/supabase'
import { roleManagementService } from '../../services/role-management.service'
import {
  canManageCategories,
  canManageArticles,
  canViewKnowledgeBase,
  isArticleAuthorOrAdmin
} from '../knowledge-base.middleware'
import { createMockResponse, mockAuthUser } from '@/__tests__/mocks/supabase'

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

// Mock role management service
vi.mock('../../services/role-management.service', () => ({
  roleManagementService: {
    checkPermission: vi.fn()
  }
}))

describe('Knowledge Base Middleware', () => {
  let mockReq: Request
  let mockRes: Response
  let mockNext: NextFunction

  beforeEach(() => {
    mockReq = {
      params: {}
    } as Request

    mockRes = {
      status: vi.fn(() => mockRes),
      json: vi.fn(() => mockRes)
    } as unknown as Response

    mockNext = vi.fn((error?: any) => { if (error) throw error }) as NextFunction

    vi.clearAllMocks()
  })

  describe('canManageCategories', () => {
    it('should allow access if user has permission', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      })

      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(true)

      await canManageCategories(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should deny access if user does not have permission', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      })

      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(false)

      await canManageCategories(mockReq, mockRes, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden' })
    })
  })

  describe('canManageArticles', () => {
    it('should allow access if user has permission', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      })

      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(true)

      await canManageArticles(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should deny access if user does not have permission', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      })

      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(false)

      await canManageArticles(mockReq, mockRes, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden' })
    })
  })

  describe('canViewKnowledgeBase', () => {
    it('should allow access if user has permission', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      })

      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(true)

      await canViewKnowledgeBase(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should deny access if user does not have permission', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      })

      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(false)

      await canViewKnowledgeBase(mockReq, mockRes, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden' })
    })
  })

  describe('isArticleAuthorOrAdmin', () => {
    it('should allow access if user is the article author', async () => {
      mockReq.params.id = 'test-article'

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(createMockResponse({ author_id: mockAuthUser.id }))
          })
        })
      } as any)

      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(false)

      await isArticleAuthorOrAdmin(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should allow access if user is an admin', async () => {
      mockReq.params.id = 'test-article'

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(createMockResponse({ author_id: 'other-user' }))
          })
        })
      } as any)

      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(true)

      await isArticleAuthorOrAdmin(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should deny access if user is neither author nor admin', async () => {
      mockReq.params.id = 'test-article'

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(createMockResponse({ author_id: 'other-user' }))
          })
        })
      } as any)

      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(false)

      await isArticleAuthorOrAdmin(mockReq, mockRes, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden' })
    })
  })
}) 