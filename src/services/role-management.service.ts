/**
 * @fileoverview Role management service for handling user roles and permissions
 * @module services/role-management
 * @description
 * Provides a comprehensive service for managing user roles, permissions, and role-based
 * access control (RBAC). Handles role assignments, permission checks, and audit logging
 * using Supabase as the backend.
 */

import { supabase } from "../lib/supabase"
import { createClient } from '@supabase/supabase-js'
import type { UserRole, Permission, RoleAuditLog } from "../types/role.types"

/**
 * Required environment variables for role management service
 * Uses service role client for admin operations that bypass RLS
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing required environment variables for role management')
}

/**
 * Supabase client with service role for admin operations
 * This client bypasses RLS policies for role management operations
 */
export const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Parameters for assigning a role to a user
 * 
 * @interface
 * @property {string} userId - ID of the user to assign the role to
 * @property {UserRole} role - Role to assign to the user
 * @property {string} performedBy - ID of the user performing the assignment
 */
export type AssignRoleParams = {
  userId: string
  role: UserRole
  performedBy: string
}

/**
 * Parameters for checking a user's permission
 * 
 * @interface
 * @property {string} userId - ID of the user to check permissions for
 * @property {string} permission - Permission to check
 */
export type CheckPermissionParams = {
  userId: string
  permission: string
}

/**
 * Database representation of a permission
 * 
 * @interface
 * @property {string} id - Unique identifier for the permission
 * @property {string} name - Name of the permission
 * @property {string | null} description - Optional description of the permission
 */
interface DatabasePermission {
  id: string
  name: string
  description: string | null
}

/**
 * Response structure for role permission queries
 * 
 * @interface
 * @property {Object} permissions - Permission details from the database
 */
interface RolePermissionResponse {
  permissions: {
    id: string
    name: string
    description: string | null
  }
}

/**
 * Service for managing user roles and permissions
 * 
 * Features:
 * - Role assignment and removal
 * - Permission checking
 * - Role permission management
 * - Audit logging
 * - Service role operations
 * 
 * @example
 * ```typescript
 * // Assign a role to a user
 * await roleManagementService.assignRole({
 *   userId: 'user123',
 *   role: 'admin',
 *   performedBy: 'admin456'
 * });
 * 
 * // Check if a user has a permission
 * const hasPermission = await roleManagementService.checkPermission({
 *   userId: 'user123',
 *   permission: 'tickets:create'
 * });
 * ```
 */
export const roleManagementService = {
  /**
   * Get a user's current role
   * 
   * @async
   * @param {string} userId - ID of the user to get the role for
   * @returns {Promise<string | null>} The user's role or null if not found
   * @throws {Error} If there's an error fetching the role
   */
  async getUserRole(userId: string) {
    const { data, error } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data?.role ?? null
  },

  /**
   * Assign a role to a user
   * 
   * Creates or updates a user's role and logs the change in the audit log.
   * Uses service client to bypass RLS for role management operations.
   * 
   * @async
   * @param {AssignRoleParams} params - Parameters for role assignment
   * @returns {Promise<{ success: boolean }>} Success status of the operation
   * @throws {Error} If there's an error assigning the role or logging the change
   */
  async assignRole({ userId, role, performedBy }: AssignRoleParams) {
    console.log('Role management service: assigning role', { userId, role, performedBy });

    // Get current role using service client
    const { data: oldRole } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    console.log('Current role:', oldRole);

    // Update role using service client
    const { error: roleError } = await serviceClient
      .from('user_roles')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id' })

    if (roleError) {
      console.error('Error updating role:', roleError);
      throw roleError;
    }

    console.log('Role updated, logging change');

    // Log the role change using service client
    const { error: logError } = await serviceClient
      .from('role_audit_log')
      .insert({
        user_id: userId,
        action: oldRole ? 'update' : 'create',
        old_role: oldRole?.role,
        new_role: role,
        performed_by: performedBy
      })

    if (logError) {
      console.error('Error logging role change:', logError);
      throw logError;
    }

    console.log('Role change logged successfully');
    return { success: true }
  },

  /**
   * Remove a user's role
   * 
   * Deletes the user's role and logs the change in the audit log.
   * Uses service client to bypass RLS for role management operations.
   * 
   * @async
   * @param {string} userId - ID of the user to remove the role from
   * @param {string} performedBy - ID of the user performing the removal
   * @returns {Promise<{ success: boolean }>} Success status of the operation
   * @throws {Error} If there's an error removing the role or logging the change
   */
  async removeRole(userId: string, performedBy: string) {
    const { data: oldRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    if (!oldRole) return { success: true }

    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (roleError) throw roleError

    // Log the role removal using service client to bypass RLS
    const { error: logError } = await serviceClient
      .from('role_audit_log')
      .insert({
        user_id: userId,
        action: 'delete',
        old_role: oldRole.role,
        new_role: null,
        performed_by: performedBy
      })

    if (logError) throw logError

    return { success: true }
  },

  /**
   * Check if a user has a specific permission
   * 
   * Uses a database function to check if the user's role grants
   * the specified permission.
   * 
   * @async
   * @param {CheckPermissionParams} params - Parameters for permission check
   * @returns {Promise<boolean>} Whether the user has the permission
   * @throws {Error} If there's an error checking the permission
   */
  async checkPermission({ userId, permission }: CheckPermissionParams) {
    const { data, error } = await supabase.rpc('check_user_permission', {
      user_id: userId,
      permission_name: permission
    })

    if (error) throw error
    return data as boolean
  },

  /**
   * Get all permissions assigned to a role
   * 
   * Retrieves the complete list of permissions granted to a specific role,
   * including permission descriptions.
   * 
   * @async
   * @param {UserRole} role - Role to get permissions for
   * @returns {Promise<Permission[]>} Array of permissions granted to the role
   * @throws {Error} If there's an error fetching the permissions
   */
  async getRolePermissions(role: UserRole) {
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          id,
          name,
          description
        )
      `)
      .eq('role', role)

    if (error) throw error

    const rolePermissions = data as unknown as RolePermissionResponse[]
    return rolePermissions.map(d => ({
      name: d.permissions.name,
      description: d.permissions.description || ''
    })) as Permission[]
  },

  /**
   * Get the audit log of role changes for a user
   * 
   * Retrieves a chronological history of role changes for a user,
   * including who performed each change.
   * 
   * @async
   * @param {string} userId - ID of the user to get the audit log for
   * @returns {Promise<RoleAuditLog[]>} Array of role change audit entries
   * @throws {Error} If there's an error fetching the audit log
   */
  async getUserRoleAuditLog(userId: string) {
    const { data, error } = await supabase
      .from('role_audit_log')
      .select(`
        *,
        performed_by_user:performed_by (
          email
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as RoleAuditLog[]
  }
} 