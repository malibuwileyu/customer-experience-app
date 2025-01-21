import { supabase } from '@/lib/supabase'
import { roleManagementService } from '@/services/role-management.service'
import { TEST_USERS, setupTestUsers, cleanupTestUsers } from '../setup/test-users'
import { randomUUID } from 'crypto'

describe('Role Management Service', () => {
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

  describe('getUserRole', () => {
    it('should return the correct role for a user', async () => {
      const role = await roleManagementService.getUserRole(TEST_USERS.admin.id)
      expect(role).toBe('admin')
    })

    it('should return null for non-existent user', async () => {
      const role = await roleManagementService.getUserRole(randomUUID())
      expect(role).toBeNull()
    })
  })

  describe('assignRole', () => {
    it('should assign a new role to a user', async () => {
      // First verify the user exists and has initial role
      const initialRole = await roleManagementService.getUserRole(TEST_USERS.customer.id)
      expect(initialRole).toBe('customer')

      await roleManagementService.assignRole({
        userId: TEST_USERS.customer.id,
        role: 'agent',
        performedBy: TEST_USERS.admin.id
      })

      const newRole = await roleManagementService.getUserRole(TEST_USERS.customer.id)
      expect(newRole).toBe('agent')

      // Reset role
      await roleManagementService.assignRole({
        userId: TEST_USERS.customer.id,
        role: 'customer',
        performedBy: TEST_USERS.admin.id
      })
    })

    it('should create audit log entry when assigning role', async () => {
      // First verify the user exists and has initial role
      const initialRole = await roleManagementService.getUserRole(TEST_USERS.customer.id)
      expect(initialRole).toBe('customer')

      await roleManagementService.assignRole({
        userId: TEST_USERS.customer.id,
        role: 'agent',
        performedBy: TEST_USERS.admin.id
      })

      const { data: logs } = await supabase
        .from('role_audit_log')
        .select()
        .eq('user_id', TEST_USERS.customer.id)
        .order('created_at', { ascending: false })
        .limit(1)

      expect(logs?.[0]).toMatchObject({
        user_id: TEST_USERS.customer.id,
        action: 'update',
        old_role: 'customer',
        new_role: 'agent',
        performed_by: TEST_USERS.admin.id
      })

      // Reset role
      await roleManagementService.assignRole({
        userId: TEST_USERS.customer.id,
        role: 'customer',
        performedBy: TEST_USERS.admin.id
      })
    })
  })

  describe('checkPermission', () => {
    it('should return true for valid permission', async () => {
      // First verify the user exists and has agent role
      const role = await roleManagementService.getUserRole(TEST_USERS.agent.id)
      expect(role).toBe('agent')

      const hasPermission = await roleManagementService.checkPermission({
        userId: TEST_USERS.agent.id,
        permission: 'view:tickets'
      })
      expect(hasPermission).toBe(true)
    })

    it('should return false for invalid permission', async () => {
      const hasPermission = await roleManagementService.checkPermission({
        userId: TEST_USERS.customer.id,
        permission: 'manage:roles'
      })
      expect(hasPermission).toBe(false)
    })
  })

  describe('getRolePermissions', () => {
    it('should return all permissions for a role', async () => {
      const permissions = await roleManagementService.getRolePermissions('admin')
      expect(permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'manage:users',
            description: expect.any(String)
          })
        ])
      )
    })

    it('should return limited permissions for customer role', async () => {
      const permissions = await roleManagementService.getRolePermissions('customer')
      const permissionNames = permissions.map(p => p.name)
      expect(permissionNames).toEqual(
        expect.arrayContaining(['view:tickets', 'create:tickets', 'view:kb'])
      )
    })
  })
}) 