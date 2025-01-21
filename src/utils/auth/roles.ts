/**
 * @fileoverview Role-based access control utilities
 * @module utils/auth/roles
 * @description
 * Provides utilities for role-based access control (RBAC)
 * including role checks, permission validation, and role hierarchy.
 */

import { UserRole } from '../../types/role.types';

/**
 * Role hierarchy defining role relationships
 * Higher index roles include permissions of lower index roles
 * 
 * @type {UserRole[]}
 */
export const roleHierarchy: UserRole[] = [
  'customer',
  'agent',
  'team_lead',
  'admin',
  'super_admin',
];

/**
 * Gets the role level in the hierarchy
 * 
 * @function getRoleLevel
 * @param {UserRole} role - Role to check
 * @returns {number} Role level (index in hierarchy)
 * 
 * @example
 * ```typescript
 * const level = getRoleLevel('admin');
 * // 3
 * ```
 */
export function getRoleLevel(role: UserRole): number {
  return roleHierarchy.indexOf(role);
}

/**
 * Checks if a role has sufficient privileges
 * 
 * @function hasRole
 * @param {UserRole} userRole - User's role
 * @param {UserRole} requiredRole - Required role level
 * @returns {boolean} Whether the user has sufficient privileges
 * 
 * @example
 * ```typescript
 * const canAccess = hasRole('admin', 'agent');
 * // true (admin has higher privileges than agent)
 * ```
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

/**
 * Checks if a role has sufficient privileges for any of the required roles
 * 
 * @function hasAnyRole
 * @param {UserRole} userRole - User's role
 * @param {UserRole[]} requiredRoles - Array of required roles
 * @returns {boolean} Whether the user has sufficient privileges
 * 
 * @example
 * ```typescript
 * const canAccess = hasAnyRole('team_lead', ['agent', 'admin']);
 * // true (team_lead has higher privileges than agent)
 * ```
 */
export function hasAnyRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => hasRole(userRole, role));
}

/**
 * Gets all roles that a user can manage based on their role
 * Users can manage roles of lower privilege level
 * 
 * @function getManageableRoles
 * @param {UserRole} userRole - User's role
 * @returns {UserRole[]} Array of roles the user can manage
 * 
 * @example
 * ```typescript
 * const roles = getManageableRoles('admin');
 * // ['customer', 'agent', 'team_lead']
 * ```
 */
export function getManageableRoles(userRole: UserRole): UserRole[] {
  const userLevel = getRoleLevel(userRole);
  return roleHierarchy.filter((_, index) => index < userLevel);
}

/**
 * Gets a human-readable role display name
 * 
 * @function getRoleDisplayName
 * @param {UserRole} role - Role to format
 * @returns {string} Formatted role name
 * 
 * @example
 * ```typescript
 * const display = getRoleDisplayName('team_lead');
 * // 'Team Lead'
 * ```
 */
export function getRoleDisplayName(role: UserRole): string {
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Gets the next role in the hierarchy
 * Used for role promotions
 * 
 * @function getNextRole
 * @param {UserRole} currentRole - Current role
 * @returns {UserRole | null} Next role or null if at highest level
 * 
 * @example
 * ```typescript
 * const nextRole = getNextRole('agent');
 * // 'team_lead'
 * ```
 */
export function getNextRole(currentRole: UserRole): UserRole | null {
  const currentLevel = getRoleLevel(currentRole);
  const nextRole = roleHierarchy[currentLevel + 1];
  return nextRole || null;
}

/**
 * Gets the previous role in the hierarchy
 * Used for role demotions
 * 
 * @function getPreviousRole
 * @param {UserRole} currentRole - Current role
 * @returns {UserRole | null} Previous role or null if at lowest level
 * 
 * @example
 * ```typescript
 * const prevRole = getPreviousRole('team_lead');
 * // 'agent'
 * ```
 */
export function getPreviousRole(currentRole: UserRole): UserRole | null {
  const currentLevel = getRoleLevel(currentRole);
  const prevRole = roleHierarchy[currentLevel - 1];
  return prevRole || null;
} 