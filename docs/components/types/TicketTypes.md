# Ticket Types Documentation

## Core Types

### Status and Priority

```typescript
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
```

These types are used throughout the ticket system to represent ticket states and importance levels.

## Data Models

### Ticket Interface

```typescript
interface Ticket {
  id: string                  // Unique identifier
  title: string              // Ticket title
  description: string        // Detailed description
  priority: TicketPriority   // Ticket priority level
  status: TicketStatus      // Current status
  created_at: string        // Creation timestamp
  updated_at: string        // Last update timestamp
  created_by: string        // Creator's ID
  assignee_id?: string      // Assigned user's ID (optional)
  category_id?: string      // Category ID (optional)
  team_id?: string          // Assigned team's ID (optional)
  internal_notes?: string   // Private notes (optional)
  attachments?: string[]    // File attachments (optional)
  tags?: string[]           // Associated tags (optional)
  
  // Expanded relationships
  category?: {
    id: string
    name: string
  }
  team?: {
    id: string
    name: string
  }
  assigned_to?: {
    id: string
    full_name: string
    avatar_url?: string | null
  }
  created_by_user?: {
    id: string
    full_name: string
    avatar_url?: string | null
  }
}
```

### Comment Interface

```typescript
interface TicketComment {
  id: string
  ticket_id: string
  content: string
  is_internal: boolean
  created_at: string
  user: {
    id: string
    name: string
    email: string
    avatar_url?: string | null
  }
}
```

### History Interfaces

```typescript
interface TicketStatusHistory {
  id: string
  ticket_id: string
  old_status: TicketStatus
  new_status: TicketStatus
  changed_at: string
  changed_by_user: {
    id: string
    name: string
    avatar_url?: string | null
  }
}

interface TicketAssignmentHistory {
  id: string
  ticket_id: string
  changed_at: string
  assigned_by_user: {
    id: string
    name: string
  }
  old_assignee?: {
    id: string
    name: string
  }
  new_assignee: {
    id: string
    name: string
  }
}
```

## Component Props

### TicketList Props

```typescript
interface TicketListProps {
  selectedTickets?: string[]           // Array of selected ticket IDs
  onSelectTicket?: (ticketId: string) => void  // Selection callback
  onSelectAll?: (ticketIds: string[]) => void  // Bulk selection callback
  isAdminView?: boolean               // Admin view toggle
}
```

### TicketItem Props

```typescript
interface TicketItemProps {
  ticket: Ticket           // Ticket data
  selected?: boolean       // Selection state
  onSelect?: (ticketId: string) => void  // Selection callback
}
```

### BulkActionDialog Props

```typescript
interface BulkActionDialogProps {
  isOpen: boolean
  onClose: () => void
  ticketIds: string[]
  onUpdate: () => void
}
```

## Data Transfer Objects (DTOs)

### Create Ticket

```typescript
interface CreateTicketDTO {
  title: string
  description: string
  priority: TicketPriority
  category_id?: string
  team_id?: string
  assignee_id?: string
  internal_notes?: string
  attachments?: string[]
  tags?: string[]
}
```

### Update Ticket

```typescript
interface UpdateTicketDTO {
  title?: string
  description?: string
  priority?: TicketPriority
  status?: TicketStatus
  category_id?: string
  team_id?: string
  assignee_id?: string
  internal_notes?: string
  attachments?: string[]
  tags?: string[]
}
```

## Filter and Sort Types

### Ticket Filters

```typescript
interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  assignedTo?: string
  team_id?: string
  category_id?: string
  tags?: string[]
  search?: string
  dateRange?: {
    start: string
    end: string
  }
}
```

### Sort Configuration

```typescript
interface TicketSort {
  field: keyof Ticket
  direction: 'asc' | 'desc'
}
```

## State Management

### Ticket State

```typescript
interface TicketState {
  tickets: Ticket[]
  comments: TicketComment[]
  selectedTicket: Ticket | null
  filters: Partial<TicketFilters>
  sort: TicketSort
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isCommenting: boolean
  error: Error | null
}
```

## Usage Guidelines

1. **Type Safety**
   - Always use these types with TypeScript's strict mode
   - Avoid type assertions unless absolutely necessary
   - Use optional properties appropriately

2. **Props Best Practices**
   - Keep props interfaces minimal and focused
   - Use optional props with sensible defaults
   - Document complex prop requirements

3. **State Management**
   - Use TicketState interface for global state
   - Handle loading and error states appropriately
   - Maintain consistent state shape

4. **DTOs**
   - Use CreateTicketDTO for new tickets
   - Use UpdateTicketDTO for modifications
   - Validate data before sending to API

5. **History Tracking**
   - Use history interfaces for audit trails
   - Maintain consistent timestamp format
   - Include user information in changes
