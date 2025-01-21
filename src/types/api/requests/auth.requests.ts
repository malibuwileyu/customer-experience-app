/**
 * @fileoverview Authentication API request types
 * @module types/api/requests/auth
 * @description
 * Type definitions for authentication-related API requests.
 */

import { UserRole } from '../../role.types';

/**
 * Sign in request payload
 * 
 * @interface SignInRequest
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */
export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Sign up request payload
 * 
 * @interface SignUpRequest
 * @property {string} email - User's email address
 * @property {string} password - User's password
 * @property {string} [full_name] - User's full name
 * @property {UserRole} [role] - User's role (defaults to 'customer')
 */
export interface SignUpRequest {
  email: string;
  password: string;
  full_name?: string;
  role?: UserRole;
}

/**
 * Password reset request payload
 * 
 * @interface ResetPasswordRequest
 * @property {string} email - User's email address
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Password update request payload
 * 
 * @interface UpdatePasswordRequest
 * @property {string} password - New password
 */
export interface UpdatePasswordRequest {
  password: string;
}

/**
 * Profile update request payload
 * 
 * @interface UpdateProfileRequest
 * @property {string} [full_name] - User's full name
 * @property {string} [avatar_url] - URL to user's avatar image
 * @property {Record<string, unknown>} [preferences] - User preferences
 * @property {Record<string, unknown>} [metadata] - Additional user metadata
 */
export interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string;
  preferences?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
} 