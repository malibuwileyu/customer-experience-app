import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

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
    // Create test users
    for (const [key, userData] of Object.entries(TEST_USER_DATA)) {
      try {
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

        // Store user data with actual auth ID
        TEST_USERS[key as keyof typeof TEST_USER_DATA] = {
          ...userData,
          id: authData.user.id
        }

        // Assign role using service client (bypasses RLS)
        const { error: roleError } = await serviceClient
          .from('user_roles')
          .insert({ user_id: authData.user.id, role: userData.role })

        if (roleError) throw roleError
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
      admin: permissions.map(p => p.id), // Admin has all permissions
      agent: permissions
        .filter(p => ['view:tickets', 'create:tickets'].includes(p.name))
        .map(p => p.id),
      customer: permissions
        .filter(p => ['view:tickets', 'create:tickets', 'view:kb'].includes(p.name))
        .map(p => p.id)
    }

    // Assign role permissions using service client
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
    for (const [key, userData] of Object.entries(TEST_USERS)) {
      // Delete user role first
      await serviceClient
        .from('user_roles')
        .delete()
        .eq('user_id', userData.id)

      // Delete auth user
      await serviceClient.auth.admin.deleteUser(userData.id)
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