/**
 * @fileoverview User type definitions
 * @module types/models/user
 */

export interface User {
  id: string
  full_name?: string
  email?: string
  avatar_url?: string
  role?: string
  created_at?: string
  updated_at?: string
  metadata?: Record<string, unknown>
} 