/**
 * @fileoverview Ticket service test suite
 * @module services/__tests__/ticket
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
import { ticketService } from '../../../services/ticket.service'
import { supabase } from '../../../lib/supabase'
import type { CreateTicketDTO, TicketStatus, TicketPriority } from '../../../types/models/ticket.types'

describe('Ticket Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTicket', () => {
    it('should create a ticket successfully', async () => {
      const mockUser = { id: 'test-user-id' }
      const mockTicket: CreateTicketDTO = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'medium' as TicketPriority
      }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      } as any)

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'test-ticket-id', ...mockTicket, created_by: mockUser.id },
              error: null
            })
          })
        })
      } as any)

      const result = await ticketService.createTicket(mockTicket)
      expect(result).toEqual({ id: 'test-ticket-id', ...mockTicket, created_by: mockUser.id })
    })

    it('should throw error when ticket creation fails', async () => {
      const mockUser = { id: 'test-user-id' }
      const mockTicket: CreateTicketDTO = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'medium' as TicketPriority
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
              error: { message: 'Failed to create ticket' }
            })
          })
        })
      } as any)

      await expect(ticketService.createTicket(mockTicket))
        .rejects.toThrow('Failed to create ticket')
    })
  })

  describe('getTicket', () => {
    it('should return ticket when found', async () => {
      const mockTicket = {
        id: 'test-ticket-id',
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'medium' as TicketPriority,
        status: 'open' as TicketStatus,
        created_by: 'test-user-id',
        created_at: '2024-01-26T00:00:00Z',
        updated_at: '2024-01-26T00:00:00Z'
      }

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

      const result = await ticketService.getTicket('test-ticket-id')
      expect(result).toEqual(mockTicket)
    })

    it('should return null when ticket not found', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      } as any)

      const result = await ticketService.getTicket('non-existent-id')
      expect(result).toBeNull()
    })
  })

  describe('updateTicket', () => {
    it('should update ticket successfully', async () => {
      const mockUpdate = {
        title: 'Updated Ticket',
        status: 'in_progress' as TicketStatus
      }

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'test-ticket-id', ...mockUpdate },
                error: null
              })
            })
          })
        })
      } as any)

      const result = await ticketService.updateTicket('test-ticket-id', mockUpdate)
      expect(result).toEqual({ id: 'test-ticket-id', ...mockUpdate })
    })

    it('should throw error when update fails', async () => {
      const mockUpdate = {
        title: 'Updated Ticket'
      }

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Failed to update ticket' }
              })
            })
          })
        })
      } as any)

      await expect(ticketService.updateTicket('test-ticket-id', mockUpdate))
        .rejects.toThrow('Failed to update ticket')
    })
  })
}) 