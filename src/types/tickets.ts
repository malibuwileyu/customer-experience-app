export type TicketStatus = "open" | "in_progress" | "resolved" | "closed"
export type TicketPriority = "low" | "medium" | "high" | "urgent"

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export interface Team {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  updated_at: string
  created_by: Profile
  assigned_to: Profile | null
  team: Team | null
  category: Category | null
  custom_fields?: Record<string, any>
  tags?: string[]
  metadata?: Record<string, any>
} 