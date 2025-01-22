import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { PermissionError } from '../permission.middleware'
import { validateTicketCreation, validateTicketUpdate, canAccessTicket, canManageTicket } from '../ticket.middleware'
import { TICKET_PRIORITY, TICKET_STATUS } from '../../types/models/ticket.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../types/database.types'

// Mock data
const mockUserId = 'user-123'
const mockTicketId = 'ticket-123'
const mockTeamId = 'team-123'

// Mock request factory
const createMockRequest = (body = {}, params = {}, user: { id: string } | null = null) => {
  const supabaseMock = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  } as unknown as SupabaseClient<Database>

  return {
    body,
    params,
    user,
    supabase: supabaseMock
  } as unknown as Request
}

// Mock response
const mockResponse = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn()
} as unknown as Response

// Mock next function with proper typing for vitest mock
const mockNext = vi.fn()

describe('Ticket Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateTicketCreation', () => {
    it('should pass validation with valid ticket data', async () => {
      const req = createMockRequest({
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'medium'
      })
      const next = vi.fn()

      const middleware = validateTicketCreation()
      await middleware(req, mockResponse, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('should fail validation with missing title', async () => {
      const req = createMockRequest({
        description: 'Test Description'
      })

      await validateTicketCreation()(req, mockResponse, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Title is required'
      }))
    })

    it('should fail validation with missing description', async () => {
      const req = createMockRequest({
        title: 'Test Ticket'
      })

      await validateTicketCreation()(req, mockResponse, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Description is required'
      }))
    })

    it('should fail validation with invalid priority', async () => {
      const req = createMockRequest({
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'invalid'
      })

      await validateTicketCreation()(req, mockResponse, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid priority value'
      }))
    })
  })

  describe('validateTicketUpdate', () => {
    it('should pass validation with valid update data', async () => {
      const req = createMockRequest({
        priority: 'high',
        status: 'in_progress'
      })
      const next = vi.fn()

      const middleware = validateTicketUpdate()
      await middleware(req, mockResponse, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('should fail validation with invalid priority', async () => {
      const req = createMockRequest({
        priority: 'invalid'
      })
      const next = vi.fn()

      const middleware = validateTicketUpdate()
      await middleware(req, mockResponse, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid priority value'
      }))
    })

    it('should fail validation with invalid status', async () => {
      const req = createMockRequest({
        status: 'invalid'
      })

      await validateTicketUpdate()(req, mockResponse, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid status value'
      }))
    })
  })

  describe('canAccessTicket', () => {
    it('should allow access for ticket creator', async () => {
      const req = createMockRequest(
        {},
        { ticketId: mockTicketId },
        { id: mockUserId }
      )

      const supabaseMock = req.supabase as unknown as { single: ReturnType<typeof vi.fn> }
      supabaseMock.single.mockResolvedValue({
        data: {
          created_by: mockUserId,
          assignee_id: 'other-user',
          team_id: mockTeamId
        }
      })

      await canAccessTicket(req, mockResponse, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should allow access for ticket assignee', async () => {
      const req = createMockRequest(
        {},
        { ticketId: mockTicketId },
        { id: mockUserId }
      )

      const supabaseMock = req.supabase as unknown as { single: ReturnType<typeof vi.fn> }
      supabaseMock.single.mockResolvedValue({
        data: {
          created_by: 'other-user',
          assignee_id: mockUserId,
          team_id: mockTeamId
        }
      })

      await canAccessTicket(req, mockResponse, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should deny access for unauthorized user', async () => {
      const req = createMockRequest(
        {},
        { ticketId: mockTicketId },
        { id: mockUserId }
      )

      const supabaseMock = req.supabase as unknown as { single: ReturnType<typeof vi.fn> }
      supabaseMock.single
        .mockResolvedValueOnce({
          data: {
            created_by: 'other-user',
            assignee_id: 'other-user',
            team_id: mockTeamId
          }
        })
        .mockResolvedValueOnce({
          data: null
        })

      await canAccessTicket(req, mockResponse, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(PermissionError))
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User does not have access to this ticket'
      }))
    })
  })

  describe('canManageTicket', () => {
    it('should allow management for ticket assignee', async () => {
      const req = createMockRequest(
        {},
        { ticketId: mockTicketId },
        { id: mockUserId }
      )

      const supabaseMock = req.supabase as unknown as { single: ReturnType<typeof vi.fn> }
      supabaseMock.single.mockResolvedValue({
        data: {
          assigned_to: mockUserId,
          team_id: mockTeamId,
          teams: {
            lead_id: 'other-user'
          }
        }
      })

      await canManageTicket(req, mockResponse, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should allow management for team lead', async () => {
      const req = createMockRequest(
        {},
        { ticketId: mockTicketId },
        { id: mockUserId }
      )

      const supabaseMock = req.supabase as unknown as { single: ReturnType<typeof vi.fn> }
      supabaseMock.single.mockResolvedValue({
        data: {
          assigned_to: 'other-user',
          team_id: mockTeamId,
          teams: {
            lead_id: mockUserId
          }
        }
      })

      await canManageTicket(req, mockResponse, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should deny management for unauthorized user', async () => {
      const req = createMockRequest(
        {},
        { ticketId: mockTicketId },
        { id: mockUserId }
      )

      const supabaseMock = req.supabase as unknown as { single: ReturnType<typeof vi.fn> }
      supabaseMock.single.mockResolvedValue({
        data: {
          assigned_to: 'other-user',
          team_id: mockTeamId,
          teams: {
            lead_id: 'other-user'
          }
        }
      })

      await canManageTicket(req, mockResponse, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(PermissionError))
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User does not have permission to manage this ticket'
      }))
    })
  })
}) 