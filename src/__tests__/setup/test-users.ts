import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@/types/role.types'

// Get Supabase URL from the regular client
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing required environment variables for test setup')
}

// Create a service role client for test setup
const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Generate unique test user emails
const timestamp = Date.now()
const TEST_USER_DATA = {
  admin: {
    email: `testuser_admin_${timestamp}@example.com`,
    password: 'Test123!@#',
    role: 'admin' as UserRole
  },
  agent: {
    email: `testuser_agent_${timestamp}@example.com`,
    password: 'Test123!@#',
    role: 'agent' as UserRole
  },
  customer: {
    email: `testuser_customer_${timestamp}@example.com`,
    password: 'Test123!@#',
    role: 'customer' as UserRole
  }
}

// This will be populated during setup
export let TEST_USERS: Record<keyof typeof TEST_USER_DATA, typeof TEST_USER_DATA[keyof typeof TEST_USER_DATA] & { id: string }> = {} as any

const REQUIRED_PERMISSIONS = [
  'view:tickets',
  'create:tickets',
  'manage:roles',
  'manage:users',
  'view:kb'
]

/**
 * Sets up test users in the database if they don't exist
 */
export async function setupTestUsers() {
  try {
    // Check for existing test users first
    const { data: existingUsers, error: listError } = await serviceClient.auth.admin.listUsers()
    if (listError) throw listError

    // Create test users
    for (const [key, userData] of Object.entries(TEST_USER_DATA)) {
      try {
        // Check if user with this email already exists
        const existingUser = existingUsers.users.find(u => u.email === userData.email)

        let userId: string

        if (existingUser) {
          console.log(`Using existing test user ${userData.email}`)
          userId = existingUser.id
          
          // Store user data
          TEST_USERS[key as keyof typeof TEST_USER_DATA] = {
            ...userData,
            id: existingUser.id
          }
        } else {
          // Create new user
          const { data: authData, error: createError } = await serviceClient.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true
          })

          if (createError) {
            console.error(`Failed to create user ${userData.email}:`, createError)
            throw createError
          }

          // Verify user was created
          if (!authData?.user) {
            throw new Error(`Failed to create user ${userData.email}`)
          }

          userId = authData.user.id
          console.log(`Created new test user ${userData.email}`)

          // Store user data
          TEST_USERS[key as keyof typeof TEST_USER_DATA] = {
            ...userData,
            id: authData.user.id
          }
        }

        // Check for existing role
        const { data: existingRole } = await serviceClient
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single()

        if (!existingRole) {
          // Assign role using service client (bypasses RLS)
          const { error: roleError } = await serviceClient
            .from('user_roles')
            .insert({ user_id: userId, role: userData.role })

          if (roleError) throw roleError
        }
      } catch (error) {
        console.error(`Error setting up user ${userData.email}:`, error)
        throw error
      }
    }

    // Get existing permissions
    const { data: permissions, error: permError } = await serviceClient
      .from('permissions')
      .select('id, name, description')
      .in('name', REQUIRED_PERMISSIONS)

    if (permError) throw permError
    if (!permissions) throw new Error('Failed to get permissions')

    // Clean up existing role permissions for test roles
    await serviceClient
      .from('role_permissions')
      .delete()
      .in('role', Object.values(TEST_USER_DATA).map(u => u.role))

    // Define role permissions
    const rolePermissions = {
      admin: permissions.map(p => p.id), // Admin has all permissions
      agent: permissions
        .filter(p => ['view:tickets', 'create:tickets'].includes(p.name))
        .map(p => p.id),
      customer: permissions
        .filter(p => ['view:tickets', 'create:tickets', 'view:kb'].includes(p.name))
        .map(p => p.id)
    }

    // Assign role permissions using service client
    for (const [role, permissionIds] of Object.entries(rolePermissions)) {
      if (permissionIds.length > 0) {
        const { error: rpError } = await serviceClient
          .from('role_permissions')
          .insert(
            permissionIds.map(permissionId => ({
              role,
              permission_id: permissionId
            }))
          )

        if (rpError) throw rpError
      }
    }

    // Sign in as admin for tests
    await supabase.auth.signInWithPassword({
      email: TEST_USERS.admin.email,
      password: TEST_USERS.admin.password
    })
  } catch (error) {
    console.error('Error setting up test users:', error)
    throw error
  }
}

/**
 * Cleans up test data
 */
export async function cleanupTestUsers() {
  try {
    // Clean up role permissions for test roles
    await serviceClient
      .from('role_permissions')
      .delete()
      .in('role', Object.values(TEST_USER_DATA).map(u => u.role))

    // Clean up user roles and delete auth users
    for (const { id } of Object.values(TEST_USERS)) {
      // Delete user role first
      await serviceClient
        .from('user_roles')
        .delete()
        .eq('user_id', id)

      // Delete user profile
      await serviceClient
        .from('profiles')
        .delete()
        .eq('id', id)

      // Delete any team memberships
      await serviceClient
        .from('team_members')
        .delete()
        .eq('user_id', id)

      // Delete auth user (this should cascade delete other related data)
      await serviceClient.auth.admin.deleteUser(id)
    }

    // Reset TEST_USERS
    TEST_USERS = {} as any

    // Sign out current user
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Error cleaning up test users:', error)
    throw error
  }
} 