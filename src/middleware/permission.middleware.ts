/**
 * @fileoverview Permission middleware for role-based access control
 * @module middleware/permission
 * @description
 * Provides middleware functions for checking user permissions against required
 * access levels. Supports single permission checks, any-match checks, and
 * all-required checks with customizable error handling.
 */

import { roleManagementService } from '../services/role-management.service'

/**
 * Custom error class for permission-related errors
 * 
 * @class
 * @extends {Error}
 * @example
 * ```typescript
 * throw new PermissionError('User lacks admin access')
 * ```
 */
export class PermissionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PermissionError'
  }
}

/**
 * Configuration options for permission check middleware
 * 
 * @interface
 * @property {boolean} [throwError=true] - If true, throws error; if false, returns boolean
 * @property {string} [message] - Custom error message to use when throwing errors
 */
export type RequirePermissionOptions = {
  throwError?: boolean
  message?: string
}

/**
 * Middleware to check if a user has a specific permission
 * 
 * Verifies whether the given user has the specified permission by checking
 * against the role management service. Can either throw errors or return
 * boolean based on options.
 * 
 * @async
 * @param {string} userId - ID of the user to check permissions for
 * @param {string} permission - Permission to check for
 * @param {RequirePermissionOptions} [options] - Configuration options
 * @returns {Promise<boolean>} True if user has permission, false otherwise
 * @throws {PermissionError} When user lacks permission and throwError is true
 * 
 * @example
 * ```typescript
 * // As middleware throwing errors
 * await requirePermission(user.id, 'tickets:create')
 * 
 * // As boolean check
 * const canEditTickets = await requirePermission(
 *   user.id,
 *   'tickets:edit',
 *   { throwError: false }
 * )
 * ```
 */
export const requirePermission = async (
  userId: string,
  permission: string,
  options: RequirePermissionOptions = {}
) => {
  const { throwError = true, message } = options

  try {
    const hasPermission = await roleManagementService.checkPermission({
      userId,
      permission
    })

    if (!hasPermission) {
      const error = new PermissionError(
        message || `User lacks required permission: ${permission}`
      )
      if (throwError) {
        throw error
      }
      return false
    }

    return true
  } catch (error) {
    if (error instanceof PermissionError) {
      if (throwError) {
        throw error
      }
      return false
    }
    // Handle other errors (e.g., database errors)
    const permError = new PermissionError(
      message || 'Failed to validate permission'
    )
    if (throwError) {
      throw permError
    }
    return false
  }
}

/**
 * Middleware to check if a user has any of the specified permissions
 * 
 * Verifies whether the given user has at least one of the specified permissions
 * by checking against the role management service. Can either throw errors or
 * return boolean based on options.
 * 
 * @async
 * @param {string} userId - ID of the user to check permissions for
 * @param {string[]} permissions - Array of permissions to check for
 * @param {RequirePermissionOptions} [options] - Configuration options
 * @returns {Promise<boolean>} True if user has any permission, false otherwise
 * @throws {PermissionError} When user lacks all permissions and throwError is true
 * 
 * @example
 * ```typescript
 * // Check if user can either create or edit tickets
 * const canManageTickets = await requireAnyPermission(
 *   user.id,
 *   ['tickets:create', 'tickets:edit'],
 *   { throwError: false }
 * )
 * ```
 */
export const requireAnyPermission = async (
  userId: string,
  permissions: string[],
  options: RequirePermissionOptions = {}
) => {
  const { throwError = true, message } = options

  try {
    const checks = await Promise.all(
      permissions.map(permission =>
        roleManagementService.checkPermission({ userId, permission })
      )
    )

    const hasAnyPermission = checks.some(Boolean)

    if (!hasAnyPermission) {
      const error = new PermissionError(
        message || `User lacks any of required permissions: ${permissions.join(', ')}`
      )
      if (throwError) {
        throw error
      }
      return false
    }

    return true
  } catch (error) {
    if (error instanceof PermissionError) {
      if (throwError) {
        throw error
      }
      return false
    }
    const permError = new PermissionError(
      message || 'Failed to validate permissions'
    )
    if (throwError) {
      throw permError
    }
    return false
  }
}

/**
 * Middleware to check if a user has all specified permissions
 * 
 * Verifies whether the given user has all of the specified permissions
 * by checking against the role management service. Can either throw errors or
 * return boolean based on options.
 * 
 * @async
 * @param {string} userId - ID of the user to check permissions for
 * @param {string[]} permissions - Array of permissions to check for
 * @param {RequirePermissionOptions} [options] - Configuration options
 * @returns {Promise<boolean>} True if user has all permissions, false otherwise
 * @throws {PermissionError} When user lacks any permission and throwError is true
 * 
 * @example
 * ```typescript
 * // Ensure user can both view and manage knowledge base
 * await requireAllPermissions(
 *   user.id,
 *   ['kb:view', 'kb:manage'],
 *   { message: 'Insufficient knowledge base access' }
 * )
 * ```
 */
export const requireAllPermissions = async (
  userId: string,
  permissions: string[],
  options: RequirePermissionOptions = {}
) => {
  const { throwError = true, message } = options

  try {
    const checks = await Promise.all(
      permissions.map(permission =>
        roleManagementService.checkPermission({ userId, permission })
      )
    )

    const hasAllPermissions = checks.every(Boolean)

    if (!hasAllPermissions) {
      const error = new PermissionError(
        message || `User lacks all required permissions: ${permissions.join(', ')}`
      )
      if (throwError) {
        throw error
      }
      return false
    }

    return true
  } catch (error) {
    if (error instanceof PermissionError) {
      if (throwError) {
        throw error
      }
      return false
    }
    const permError = new PermissionError(
      message || 'Failed to validate permissions'
    )
    if (throwError) {
      throw permError
    }
    return false
  }
} 