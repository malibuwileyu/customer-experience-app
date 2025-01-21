import { supabase } from '@/lib/supabase'
import type { UserRole, Permission, RoleAuditLog } from '@/types/role.types'

export type AssignRoleParams = {
  userId: string
  role: UserRole
  performedBy: string
}

export type CheckPermissionParams = {
  userId: string
  permission: string
}

/**
 * Service for managing user roles and permissions
 */
export const roleManagementService = {
  /**
   * Get a user's role
   */
  async getUserRole(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data?.role as UserRole | null
  },

  /**
   * Assign a role to a user
   */
  async assignRole({ userId, role, performedBy }: AssignRoleParams) {
    const { data: oldRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id' })

    if (roleError) throw roleError

    // Log the role change
    const { error: logError } = await supabase
      .from('role_audit_log')
      .insert({
        user_id: userId,
        action: oldRole ? 'update' : 'create',
        old_role: oldRole?.role,
        new_role: role,
        performed_by: performedBy
      })

    if (logError) throw logError

    return { success: true }
  },

  /**
   * Remove a user's role
   */
  async removeRole(userId: string, performedBy: string) {
    const { data: oldRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (!oldRole) return { success: true }

    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (roleError) throw roleError

    // Log the role removal
    const { error: logError } = await supabase
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
   * Get all permissions for a role
   */
  async getRolePermissions(role: UserRole) {
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          name,
          description
        )
      `)
      .eq('role', role)

    if (error) throw error
    return data?.map(d => d.permissions) as Permission[]
  },

  /**
   * Get audit log for a user's role changes
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