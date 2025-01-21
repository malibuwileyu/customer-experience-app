import { supabase } from '@/lib/supabase'
import { requirePermission, requireAnyPermission, requireAllPermissions, PermissionError } from '@/middleware/permission.middleware'
import { TEST_USERS, setupTestUsers, cleanupTestUsers } from '../setup/test-users'

describe('Permission Middleware', () => {
  // Setup test data
  beforeAll(async () => {
    await setupTestUsers()
  })

  // Sign in as admin before each test
  beforeEach(async () => {
    await supabase.auth.signInWithPassword({
      email: TEST_USERS.admin.email,
      password: TEST_USERS.admin.password
    })
  })

  // Sign out after each test
  afterEach(async () => {
    await supabase.auth.signOut()
  })

  // Cleanup test data
  afterAll(async () => {
    await cleanupTestUsers()
  })

  describe('requirePermission', () => {
    it('should allow access with valid permission', async () => {
      const result = await requirePermission(TEST_USERS.agent.id, 'view:tickets')
      expect(result).toBe(true)
    })

    it('should deny access with invalid permission', async () => {
      await expect(
        requirePermission(TEST_USERS.customer.id, 'manage:roles')
      ).rejects.toThrow(PermissionError)
    })

    it('should return false instead of throwing with throwError: false', async () => {
      const result = await requirePermission(
        TEST_USERS.customer.id,
        'manage:roles',
        { throwError: false }
      )
      expect(result).toBe(false)
    })

    it('should use custom error message', async () => {
      const customMessage = 'Custom error message'
      await expect(
        requirePermission(TEST_USERS.customer.id, 'manage:roles', {
          message: customMessage
        })
      ).rejects.toThrow(customMessage)
    })
  })

  describe('requireAnyPermission', () => {
    it('should allow access with any valid permission', async () => {
      const result = await requireAnyPermission(TEST_USERS.agent.id, [
        'view:tickets',
        'manage:roles' // Agent doesn't have this
      ])
      expect(result).toBe(true)
    })

    it('should deny access with no valid permissions', async () => {
      await expect(
        requireAnyPermission(TEST_USERS.customer.id, [
          'manage:roles',
          'manage:users'
        ])
      ).rejects.toThrow(PermissionError)
    })

    it('should handle empty permission array', async () => {
      await expect(
        requireAnyPermission(TEST_USERS.customer.id, [])
      ).rejects.toThrow(PermissionError)
    })
  })

  describe('requireAllPermissions', () => {
    it('should allow access with all valid permissions', async () => {
      const result = await requireAllPermissions(TEST_USERS.agent.id, [
        'view:tickets',
        'create:tickets'
      ])
      expect(result).toBe(true)
    })

    it('should deny access with some invalid permissions', async () => {
      await expect(
        requireAllPermissions(TEST_USERS.agent.id, [
          'view:tickets',
          'manage:roles'
        ])
      ).rejects.toThrow(PermissionError)
    })

    it('should handle empty permission array', async () => {
      const result = await requireAllPermissions(TEST_USERS.agent.id, [])
      expect(result).toBe(true)
    })

    it('should use custom error message', async () => {
      const customMessage = 'Custom error message'
      await expect(
        requireAllPermissions(
          TEST_USERS.customer.id,
          ['manage:roles', 'manage:users'],
          { message: customMessage }
        )
      ).rejects.toThrow(customMessage)
    })
  })
}) 