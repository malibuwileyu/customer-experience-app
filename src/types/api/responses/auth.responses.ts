/**
 * @fileoverview Authentication API response types
 * @module types/api/responses/auth
 * @description
 * Type definitions for authentication-related API responses.
 */

import { User } from '@supabase/supabase-js';
import { Profile } from '../../auth.types';
import { ApiResponse } from '../../common';

/**
 * Sign in response data
 * 
 * @interface SignInResponseData
 * @property {User} user - Authenticated user data
 * @property {Profile} profile - User's profile data
 * @property {string} access_token - JWT access token
 * @property {string} refresh_token - JWT refresh token
 */
export interface SignInResponseData {
  user: User;
  profile: Profile;
  access_token: string;
  refresh_token: string;
}

/**
 * Sign in response
 * 
 * @type {SignInResponse}
 */
export type SignInResponse = ApiResponse<SignInResponseData>;

/**
 * Sign up response data
 * 
 * @interface SignUpResponseData
 * @property {User} user - Created user data
 * @property {Profile} profile - Created user's profile
 */
export interface SignUpResponseData {
  user: User;
  profile: Profile;
}

/**
 * Sign up response
 * 
 * @type {SignUpResponse}
 */
export type SignUpResponse = ApiResponse<SignUpResponseData>;

/**
 * Password reset response data
 * 
 * @interface ResetPasswordResponseData
 * @property {string} message - Success message
 */
export interface ResetPasswordResponseData {
  message: string;
}

/**
 * Password reset response
 * 
 * @type {ResetPasswordResponse}
 */
export type ResetPasswordResponse = ApiResponse<ResetPasswordResponseData>;

/**
 * Password update response data
 * 
 * @interface UpdatePasswordResponseData
 * @property {string} message - Success message
 */
export interface UpdatePasswordResponseData {
  message: string;
}

/**
 * Password update response
 * 
 * @type {UpdatePasswordResponse}
 */
export type UpdatePasswordResponse = ApiResponse<UpdatePasswordResponseData>;

/**
 * Profile update response data
 * 
 * @interface UpdateProfileResponseData
 * @property {Profile} profile - Updated profile data
 */
export interface UpdateProfileResponseData {
  profile: Profile;
}

/**
 * Profile update response
 * 
 * @type {UpdateProfileResponse}
 */
export type UpdateProfileResponse = ApiResponse<UpdateProfileResponseData>; 