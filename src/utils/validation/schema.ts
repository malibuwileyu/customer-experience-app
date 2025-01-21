/**
 * @fileoverview Schema validation utilities
 * @module utils/validation/schema
 * @description
 * Provides Zod schema definitions and validation utilities
 * for form data and API payloads.
 */

import { z } from 'zod';
import { UserRole } from '../../types/role.types';

/**
 * Email validation schema
 * 
 * @type {z.ZodString}
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

/**
 * Password validation schema
 * 
 * @type {z.ZodString}
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * User role validation schema
 * 
 * @type {z.ZodEnum<[UserRole, ...]>}
 */
export const roleSchema = z.enum(['customer', 'agent', 'team_lead', 'admin', 'super_admin'] as const);

/**
 * Sign in form schema
 * 
 * @type {z.ZodObject}
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

/**
 * Sign up form schema
 * 
 * @type {z.ZodObject}
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z.string().min(1, 'Full name is required'),
  role: roleSchema.optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Password reset request schema
 * 
 * @type {z.ZodObject}
 */
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Password update schema
 * 
 * @type {z.ZodObject}
 */
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Profile update schema
 * 
 * @type {z.ZodObject}
 */
export const profileUpdateSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  avatarUrl: z.string().url().optional().nullable(),
  preferences: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Ticket creation schema
 * 
 * @type {z.ZodObject}
 */
export const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum(['general', 'technical', 'billing', 'feature_request', 'bug_report']),
});

/**
 * Article creation schema
 * 
 * @type {z.ZodObject}
 */
export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(1, 'Content is required'),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'internal', 'private']),
});

/**
 * Type inference helpers
 */
export type SignInForm = z.infer<typeof signInSchema>;
export type SignUpForm = z.infer<typeof signUpSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;
export type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;
export type TicketForm = z.infer<typeof ticketSchema>;
export type ArticleForm = z.infer<typeof articleSchema>; 