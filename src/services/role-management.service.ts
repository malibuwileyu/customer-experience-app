/**
 * @fileoverview Role management service for handling user roles and permissions
 * @module services/role-management
 * @description
 * Provides a comprehensive service for managing user roles, permissions, and role-based
 * access control (RBAC). Handles role assignments, permission checks, and audit logging
 * using Supabase as the backend.
 */

import { supabaseService } from '../lib/supabase'
import type { UserRole, Permission, RoleAuditLog } from "../types/role.types"
import type { Database } from "../types/database.types"

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
   * @returns {Promise<UserRole | null>} The user's role or null if not found
   * @throws {Error} If there's an error fetching the role
   */
  async getUserRole(userId: string): Promise<UserRole | null> {
    const { data, error } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    return (data?.role as UserRole) ?? null
  },

  /**
   * Assign a role to a user
   * 
   * Updates a user's role in their profile and logs the change in the audit log.
   * Uses service client to bypass RLS for role management operations.
   * 
   * @async
   * @param {AssignRoleParams} params - Parameters for role assignment
   * @returns {Promise<{ success: boolean }>} Success status of the operation
   * @throws {Error} If there's an error assigning the role or logging the change
   */
  async assignRole({ userId, role, performedBy }: AssignRoleParams): Promise<{ success: boolean }> {
    console.log('Role management service: assigning role', { userId, role, performedBy });

    // Get current role using service client
    const { data: oldRole } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    console.log('Current role:', oldRole);

    // Update role using service client
    const { error: roleError } = await supabaseService
      .from('profiles')
      .update({ role: role as Database['public']['Enums']['user_role'] })
      .eq('id', userId)

    if (roleError) {
      console.error('Error updating role:', roleError);
      throw roleError;
    }

    console.log('Role updated, logging change');

    // Log the role change using service client
    const { error: logError } = await supabaseService
      .from('role_audit_log')
      .insert({
        user_id: userId,
        action: oldRole ? 'update' : 'create',
        old_role: oldRole?.role as UserRole | null,
        new_role: role,
        changed_by: performedBy
      } satisfies Omit<RoleAuditLog, 'id' | 'created_at' | 'performed_by_user'>)

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
   * Sets the user's role back to 'customer' and logs the change in the audit log.
   * Uses service client to bypass RLS for role management operations.
   * 
   * @async
   * @param {string} userId - ID of the user to remove the role from
   * @param {string} performedBy - ID of the user performing the removal
   * @returns {Promise<{ success: boolean }>} Success status of the operation
   * @throws {Error} If there's an error removing the role or logging the change
   */
  async removeRole(userId: string, performedBy: string): Promise<{ success: boolean }> {
    const { data: oldRole } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (!oldRole) return { success: true }

    // Set role back to customer
    const { error: roleError } = await supabaseService
      .from('profiles')
      .update({ role: 'customer' as Database['public']['Enums']['user_role'] })
      .eq('id', userId)

    if (roleError) throw roleError

    // Log the role removal using service client to bypass RLS
    const { error: logError } = await supabaseService
      .from('role_audit_log')
      .insert({
        user_id: userId,
        action: 'delete',
        old_role: oldRole.role as UserRole,
        new_role: 'customer',
        changed_by: performedBy
      } satisfies Omit<RoleAuditLog, 'id' | 'created_at' | 'performed_by_user'>)

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
  async checkPermission({ userId, permission }: CheckPermissionParams): Promise<boolean> {
    const { data, error } = await supabaseService.rpc('check_user_permission', {
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
  async getRolePermissions(role: UserRole): Promise<Permission[]> {
    type RolePermissionResult = {
      permissions: {
        id: string;
        name: string;
        description: string | null;
      };
    };

    const { data, error } = await supabaseService
      .from('role_permissions')
      .select(`
        permissions (
          id,
          name,
          description
        )
      `)
      .eq('role', role as Database['public']['Enums']['user_role'])

    if (error) throw error

    return ((data as unknown as RolePermissionResult[]) || []).map(rp => ({
      name: rp.permissions.name,
      description: rp.permissions.description || ''
    }))
  },

  /**
   * Get the audit log for a user's role changes
   * 
   * Retrieves a history of all role changes for a specific user,
   * including who performed each change.
   * 
   * @async
   * @param {string} userId - ID of the user to get the audit log for
   * @returns {Promise<RoleAuditLog[]>} Array of role change audit entries
   * @throws {Error} If there's an error fetching the audit log
   */
  async getUserRoleAuditLog(userId: string): Promise<RoleAuditLog[]> {
    type AuditLogResult = {
      id: string;
      user_id: string;
      action: 'create' | 'update' | 'delete';
      old_role: Database['public']['Enums']['user_role'] | null;
      new_role: Database['public']['Enums']['user_role'] | null;
      changed_by: string;
      performed_by_user?: {
        email: string;
      };
      created_at: string;
    };

    const { data, error } = await supabaseService
      .from('role_audit_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return ((data as unknown as AuditLogResult[]) || []).map(log => ({
      ...log,
      old_role: log.old_role as UserRole | null,
      new_role: log.new_role as UserRole | null
    }))
  }
} 