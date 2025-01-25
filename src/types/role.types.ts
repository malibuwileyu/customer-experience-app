/**
 * @fileoverview Role-based access control type definitions
 * @module types/role
 * @description
 * Defines the core types for role-based access control (RBAC) in the application.
 * Includes user roles, permissions, and audit logging types.
 */

/**
 * Available user roles in the system, ordered by increasing privilege level
 * 
 * @type {UserRole}
 * @property {'customer'} - Base level user with access to tickets and knowledge base
 * @property {'agent'} - Support agent who can handle tickets
 * @property {'team_lead'} - Team leader with additional management capabilities
 * @property {'admin'} - Administrator with system configuration access
 * @property {'super_admin'} - Highest privilege level with full system access
 */
export type UserRole = 'customer' | 'agent' | 'team_lead' | 'admin' | 'super_admin'

/**
 * Permission definition for granular access control
 * 
 * @interface Permission
 * @property {string} name - Unique identifier for the permission
 * @property {string} description - Human-readable description of the permission
 */
export interface Permission {
  name: string
  description: string
}

/**
 * Audit log entry for role changes
 * 
 * @interface RoleAuditLog
 * @property {string} id - Unique identifier for the audit log entry
 * @property {string} user_id - ID of the user whose role was changed
 * @property {'create' | 'update' | 'delete'} action - Type of role change action
 * @property {UserRole | null} old_role - Previous role (null for new users)
 * @property {UserRole | null} new_role - New role (null for deleted users)
 * @property {string} changed_by - ID of the user who performed the change
 * @property {{ email: string }} [performed_by_user] - Email of the user who performed the change
 * @property {string} created_at - ISO timestamp of when the change occurred
 */
export interface RoleAuditLog {
  id: string
  user_id: string
  action: 'create' | 'update' | 'delete'
  old_role: UserRole | null
  new_role: UserRole | null
  changed_by: string
  performed_by_user?: {
    email: string
  }
  created_at: string
} 