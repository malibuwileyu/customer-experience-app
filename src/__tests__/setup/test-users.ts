import { supabaseService } from '../../lib/supabase'
import type { Database } from '../../types/database.types'
import { UserRole } from '@/types/role.types'

// Test user constants
const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'test123!',
    role: 'admin' as UserRole
  },
  agent: {
    email: 'agent@test.com',
    password: 'test123!',
    role: 'agent' as UserRole
  },
  customer: {
    email: 'customer@test.com',
    password: 'test123!',
    role: 'customer' as UserRole
  }
}

export async function setupTestUsers() {
  try {
    // List existing users
    const { data: existingUsers, error: listError } = await supabaseService.auth.admin.listUsers()
    if (listError) throw listError

    // Delete existing test users
    for (const user of existingUsers.users) {
      if (user.email && Object.values(TEST_USERS).some(testUser => testUser.email === user.email)) {
        await supabaseService.auth.admin.deleteUser(user.id)
      }
    }

    // Create test users
    for (const [key, userData] of Object.entries(TEST_USERS)) {
      // Create user
      const { data: authData, error: createError } = await supabaseService.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      })
      if (createError) throw createError

      const userId = authData.user.id

      // Check for existing profile
      const { data: existingProfile } = await supabaseService
        .from('profiles')
        .select()
        .eq('id', userId)
        .single()

      // Create profile if it doesn't exist
      if (!existingProfile) {
        const { error: profileError } = await supabaseService
          .from('profiles')
          .insert({
            id: userId,
            email: userData.email,
            full_name: `Test ${key.charAt(0).toUpperCase() + key.slice(1)}`,
            role: userData.role
          })
        if (profileError) throw profileError
      }

      // Get role permissions
      const { data: permissions, error: permError } = await supabaseService
        .from('role_permissions')
        .select('permission_id')
        .eq('role', userData.role)
      if (permError) throw permError

      // Grant permissions
      if (permissions?.length) {
        await supabaseService
          .from('user_permissions')
          .delete()
          .eq('user_id', userId)

        const { error: rpError } = await supabaseService
          .from('user_permissions')
          .insert(
            permissions.map(p => ({
              user_id: userId,
              permission_id: p.permission_id
            }))
          )
        if (rpError) throw rpError
      }
    }

    // Sign in as admin for tests
    await supabaseService.auth.signInWithPassword({
      email: TEST_USERS.admin.email,
      password: TEST_USERS.admin.password
    })

  } catch (error) {
    console.error('Error setting up test users:', error)
    throw error
  }
}

export async function cleanupTestUsers() {
  try {
    const { data: users, error } = await supabaseService.auth.admin.listUsers()
    if (error) throw error

    for (const user of users.users) {
      if (user.email && Object.values(TEST_USERS).some(testUser => testUser.email === user.email)) {
        await supabaseService.auth.admin.deleteUser(user.id)
      }
    }
  } catch (error) {
    console.error('Error cleaning up test users:', error)
    throw error
  }
}

export async function createTestUser(role: string = 'customer') {
  // ... rest of the file ...
} 