import { describe, it, expect, vi, beforeEach } from 'vitest'
import { roleManagementService, serviceClient } from '../role-management.service'
import { supabase } from '../../lib/supabase'

// Mock Supabase clients
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    })),
    rpc: vi.fn()
  }
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn()
    }))
  }))
}))

describe('Role Management Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserRole', () => {
    it('should return role when found', async () => {
      const mockUserId = 'test-user-id'
      const mockRole = 'agent'
      
      vi.mocked(serviceClient.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { role: mockRole },
              error: null
            })
          })
        })
      } as any)

      const result = await roleManagementService.getUserRole(mockUserId)
      expect(result).toBe(mockRole)
    })

    it('should return null when role not found', async () => {
      const mockUserId = 'test-user-id'
      
      vi.mocked(serviceClient.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      } as any)

      const result = await roleManagementService.getUserRole(mockUserId)
      expect(result).toBeNull()
    })
  })

  describe('checkPermission', () => {
    it('should return true when user has permission', async () => {
      const mockUserId = 'test-user-id'
      const mockPermission = 'tickets:create'
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: true,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const result = await roleManagementService.checkPermission({
        userId: mockUserId,
        permission: mockPermission
      })
      expect(result).toBe(true)
    })

    it('should return false when user does not have permission', async () => {
      const mockUserId = 'test-user-id'
      const mockPermission = 'tickets:create'
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: false,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const result = await roleManagementService.checkPermission({
        userId: mockUserId,
        permission: mockPermission
      })
      expect(result).toBe(false)
    })
  })

  describe('assignRole', () => {
    it('should assign role successfully', async () => {
      const mockParams = {
        userId: 'test-user-id',
        role: 'agent' as const,
        performedBy: 'admin-id'
      }

      // Mock getting current role
      vi.mocked(serviceClient.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      } as any)

      // Mock upserting new role
      vi.mocked(serviceClient.from).mockReturnValueOnce({
        upsert: vi.fn().mockResolvedValue({
          error: null
        })
      } as any)

      // Mock inserting audit log
      vi.mocked(serviceClient.from).mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          error: null
        })
      } as any)

      const result = await roleManagementService.assignRole(mockParams)
      expect(result).toEqual({ success: true })
    })

    it('should throw error when role assignment fails', async () => {
      const mockParams = {
        userId: 'test-user-id',
        role: 'agent' as const,
        performedBy: 'admin-id'
      }

      // Mock getting current role
      vi.mocked(serviceClient.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      } as any)

      // Mock upserting new role with error
      vi.mocked(serviceClient.from).mockReturnValueOnce({
        upsert: vi.fn().mockResolvedValue({
          error: { message: 'Failed to assign role' }
        })
      } as any)

      await expect(roleManagementService.assignRole(mockParams))
        .rejects.toThrow('Failed to assign role')
    })
  })
}) 