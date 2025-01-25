/**
 * @fileoverview Role management service test suite
 * @module services/__tests__/role-management
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
import { roleManagementService } from '../../../services/role-management.service'
import { supabase } from '../../../lib/supabase'
import type { UserRole } from '../../../types/role.types'

describe('Role Management Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserRole', () => {
    it('should return user role when found', async () => {
      const mockRole: UserRole = 'admin'
      const userId = 'test-user-id'

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: mockRole },
              error: null
            })
          })
        })
      } as any)

      const result = await roleManagementService.getUserRole(userId)
      expect(result).toBe(mockRole)
    })

    it('should return null when role not found', async () => {
      const userId = 'test-user-id'

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

      const result = await roleManagementService.getUserRole(userId)
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
      const params = {
        userId: 'test-user-id',
        role: 'admin' as UserRole,
        performedBy: 'admin-id'
      }

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
        })
      } as any)

      await expect(roleManagementService.assignRole(params)).resolves.toEqual({ success: true })
    })

    it('should throw error when assignment fails', async () => {
      const params = {
        userId: 'test-user-id',
        role: 'admin' as UserRole,
        performedBy: 'admin-id'
      }

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Failed to assign role' }
          })
        })
      } as any)

      await expect(roleManagementService.assignRole(params))
        .rejects.toThrow('Failed to assign role')
    })
  })
}) 