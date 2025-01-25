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
    it('should return true for valid permission', async () => {
      const mockUserId = 'test-user-id'
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: true,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const hasPermission = await roleManagementService.checkPermission({
        userId: mockUserId,
        permission: 'view:tickets'
      })
      expect(hasPermission).toBe(true)
    })

    it('should return false for invalid permission', async () => {
      const mockUserId = 'test-user-id'
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: false,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const hasPermission = await roleManagementService.checkPermission({
        userId: mockUserId,
        permission: 'invalid:permission'
      })
      expect(hasPermission).toBe(false)
    })
  })

  describe('getRolePermissions', () => {
    it('should return all permissions for a role', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              {
                permissions: {
                  id: '1',
                  name: 'manage:users',
                  description: 'Can manage users'
                }
              }
            ],
            error: null
          })
        })
      } as any)

      const permissions = await roleManagementService.getRolePermissions('admin')
      expect(permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'manage:users'
          })
        ])
      )
    })

    it('should return limited permissions for customer role', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              {
                permissions: {
                  id: '2',
                  name: 'view:tickets',
                  description: 'Can view tickets'
                }
              }
            ],
            error: null
          })
        })
      } as any)

      const permissions = await roleManagementService.getRolePermissions('customer')
      expect(permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'view:tickets'
          })
        ])
      )
    })
  })

  describe('assignRole', () => {
    it('should assign role successfully', async () => {
      const mockParams = {
        userId: 'test-user-id',
        role: 'agent' as const,
        performedBy: 'admin-id'
      }

      // Mock getting current role from profiles
      vi.mocked(serviceClient.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { role: 'customer' },
              error: null
            })
          })
        })
      } as any)

      // Mock updating profile role
      vi.mocked(serviceClient.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
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

      // Mock getting current role from profiles
      vi.mocked(serviceClient.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { role: 'customer' },
              error: null
            })
          })
        })
      } as any)

      // Mock updating profile role with error
      vi.mocked(serviceClient.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Failed to assign role' }
          })
        })
      } as any)

      await expect(roleManagementService.assignRole(mockParams))
        .rejects.toThrow('Failed to assign role')
    })
  })
}) 