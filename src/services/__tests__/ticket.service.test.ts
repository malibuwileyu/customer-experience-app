import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTicket, getTicketById, updateTicket } from '../ticket.service'
import { supabase } from '../../lib/supabase'
import type { TicketPriority } from '../../types/models/ticket.types'

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    })),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}))

describe('Ticket Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTicket', () => {
    it('should create a ticket successfully', async () => {
      const mockUser = { id: 'test-user-id' }
      const mockTicket = {
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

      const result = await createTicket(mockTicket)
      expect(result).toEqual({ id: 'test-ticket-id', ...mockTicket, created_by: mockUser.id })
    })

    it('should throw error when ticket creation fails', async () => {
      const mockUser = { id: 'test-user-id' }
      const mockTicket = {
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

      await expect(createTicket(mockTicket)).rejects.toThrow('Failed to create ticket')
    })
  })

  describe('getTicketById', () => {
    it('should return ticket when found', async () => {
      const mockTicket = {
        id: 'test-ticket-id',
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'medium' as TicketPriority,
        created_by: 'test-user-id'
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

      const result = await getTicketById('test-ticket-id')
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

      const result = await getTicketById('non-existent-id')
      expect(result).toBeNull()
    })
  })

  describe('updateTicket', () => {
    it('should update ticket successfully', async () => {
      const mockUpdate = {
        title: 'Updated Title',
        description: 'Updated Description'
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

      const result = await updateTicket('test-ticket-id', mockUpdate)
      expect(result).toEqual({ id: 'test-ticket-id', ...mockUpdate })
    })

    it('should throw error when update fails', async () => {
      const mockUpdate = {
        title: 'Updated Title'
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

      await expect(updateTicket('test-ticket-id', mockUpdate))
        .rejects.toThrow('Failed to update ticket')
    })
  })
}) 