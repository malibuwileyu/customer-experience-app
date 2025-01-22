import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PermissionError, requirePermission, requireAnyPermission, requireAllPermissions } from '../permission.middleware'
import { roleManagementService } from '../../services/role-management.service'

// Mock role management service
vi.mock('../../services/role-management.service', () => ({
  roleManagementService: {
    checkPermission: vi.fn()
  }
}))

// Mock data
const mockUserId = 'user-123'

describe('Permission Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requirePermission', () => {
    it('should allow access when user has permission', async () => {
      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(true)

      const result = await requirePermission(mockUserId, 'tickets:create')
      expect(result).toBe(true)
    })

    it('should deny access when user lacks permission', async () => {
      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(false)

      await expect(requirePermission(mockUserId, 'tickets:create')).rejects.toThrow(PermissionError)
    })

    it('should return false instead of throwing when throwError is false', async () => {
      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(false)

      const result = await requirePermission(mockUserId, 'tickets:create', { throwError: false })
      expect(result).toBe(false)
    })

    it('should use custom error message when provided', async () => {
      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(false)

      const customMessage = 'Custom error message'
      await expect(
        requirePermission(mockUserId, 'tickets:create', { message: customMessage })
      ).rejects.toThrow(customMessage)
    })
  })

  describe('requireAnyPermission', () => {
    it('should allow access when user has any required permission', async () => {
      vi.mocked(roleManagementService.checkPermission)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)

      const result = await requireAnyPermission(mockUserId, ['tickets:create', 'tickets:edit'])
      expect(result).toBe(true)
    })

    it('should deny access when user lacks all permissions', async () => {
      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(false)

      await expect(
        requireAnyPermission(mockUserId, ['tickets:create', 'tickets:edit'])
      ).rejects.toThrow(PermissionError)
    })

    it('should return false instead of throwing when throwError is false', async () => {
      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(false)

      const result = await requireAnyPermission(
        mockUserId,
        ['tickets:create', 'tickets:edit'],
        { throwError: false }
      )
      expect(result).toBe(false)
    })
  })

  describe('requireAllPermissions', () => {
    it('should allow access when user has all required permissions', async () => {
      vi.mocked(roleManagementService.checkPermission).mockResolvedValue(true)

      const result = await requireAllPermissions(mockUserId, ['tickets:create', 'tickets:edit'])
      expect(result).toBe(true)
    })

    it('should deny access when user lacks any required permission', async () => {
      vi.mocked(roleManagementService.checkPermission)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)

      await expect(
        requireAllPermissions(mockUserId, ['tickets:create', 'tickets:edit'])
      ).rejects.toThrow(PermissionError)
    })

    it('should return false instead of throwing when throwError is false', async () => {
      vi.mocked(roleManagementService.checkPermission)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)

      const result = await requireAllPermissions(
        mockUserId,
        ['tickets:create', 'tickets:edit'],
        { throwError: false }
      )
      expect(result).toBe(false)
    })

    it('should handle service errors gracefully', async () => {
      vi.mocked(roleManagementService.checkPermission).mockRejectedValue(new Error('Service error'))

      await expect(
        requireAllPermissions(mockUserId, ['tickets:create'])
      ).rejects.toThrow('Failed to validate permissions')
    })
  })
}) 