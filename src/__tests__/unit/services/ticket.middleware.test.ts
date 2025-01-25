/**
 * @fileoverview Ticket middleware test suite
 * @module middleware/__tests__/ticket
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
import { canAccessTicket } from '../../../middleware/ticket.middleware'
import { requirePermission } from '../../../middleware/permission.middleware'
import { supabase } from '../../../lib/supabase'
import type { UserRole } from '../../../types/role.types'
import type { Request, Response, NextFunction } from 'express'

// Mock permission middleware
vi.mock('../../../middleware/permission.middleware', () => ({
  requirePermission: vi.fn()
}))

describe('Ticket Middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: jest.Mock

  beforeEach(() => {
    vi.clearAllMocks()
    mockReq = {
      params: {},
      body: {},
      headers: {},
      user: null
    }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }
    mockNext = vi.fn()
  })

  describe('canAccessTicket', () => {
    it('should allow access for ticket owner', async () => {
      const mockUser = { id: 'test-user-id', role: 'customer' as UserRole }
      const mockTicket = {
        id: 'test-ticket-id',
        created_by: mockUser.id
      }

      mockReq.params = { ticketId: mockTicket.id }
      mockReq.user = mockUser

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      } as any)

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTicket,
              error: null
            })
          })
        })
      } as any)

      await canAccessTicket(mockReq as Request, mockRes as Response, mockNext)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should allow access for admin', async () => {
      const mockUser = { id: 'admin-id', role: 'admin' as UserRole }
      const mockTicket = {
        id: 'test-ticket-id',
        created_by: 'other-user-id'
      }

      mockReq.params = { ticketId: mockTicket.id }
      mockReq.user = mockUser

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      } as any)

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTicket,
              error: null
            })
          })
        })
      } as any)

      vi.mocked(requirePermission).mockResolvedValue(true)

      await canAccessTicket(mockReq as Request, mockRes as Response, mockNext)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should deny access for unauthorized user', async () => {
      const mockUser = { id: 'other-user-id', role: 'customer' as UserRole }
      const mockTicket = {
        id: 'test-ticket-id',
        created_by: 'test-user-id'
      }

      mockReq.params = { ticketId: mockTicket.id }
      mockReq.user = mockUser

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      } as any)

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTicket,
              error: null
            })
          })
        })
      } as any)

      vi.mocked(requirePermission).mockResolvedValue(false)

      await canAccessTicket(mockReq as Request, mockRes as Response, mockNext)
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
      expect(mockNext.mock.calls[0][0].message).toBe('User does not have access to this ticket')
    })
  })
}) 