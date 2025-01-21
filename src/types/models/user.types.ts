export interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  role?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
} 