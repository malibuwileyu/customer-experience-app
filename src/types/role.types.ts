export type UserRole = 'customer' | 'agent' | 'team_lead' | 'admin' | 'super_admin'

export interface Permission {
  name: string
  description: string
}

export interface RoleAuditLog {
  id: string
  user_id: string
  action: 'create' | 'update' | 'delete'
  old_role: UserRole | null
  new_role: UserRole | null
  performed_by: string
  performed_by_user?: {
    email: string
  }
  created_at: string
} 