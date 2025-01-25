# Ticket Components Usage Examples

## Basic Usage Patterns

### 1. Displaying a List of Tickets

```tsx
import { TicketList } from '@/components/tickets/ticket-list'

// Basic list for customers
function CustomerTicketList() {
  return <TicketList />
}

// Admin view with all tickets
function AdminTicketList() {
  return <TicketList isAdminView />
}
```

### 2. Bulk Operations with Selection

```tsx
import { useState } from 'react'
import { TicketList } from '@/components/tickets/ticket-list'
import { BulkStatusDialog } from '@/components/tickets/BulkStatusDialog'
import { BulkPriorityDialog } from '@/components/tickets/BulkPriorityDialog'
import { BulkAssignmentDialog } from '@/components/tickets/BulkAssignmentDialog'

function TicketManagement() {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showPriorityDialog, setShowPriorityDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'status':
        setShowStatusDialog(true)
        break
      case 'priority':
        setShowPriorityDialog(true)
        break
      case 'assign':
        setShowAssignDialog(true)
        break
    }
  }

  return (
    <div>
      {selectedTickets.length > 0 && (
        <div className="flex gap-2 mb-4">
          <Button onClick={() => handleBulkAction('status')}>
            Update Status
          </Button>
          <Button onClick={() => handleBulkAction('priority')}>
            Update Priority
          </Button>
          <Button onClick={() => handleBulkAction('assign')}>
            Assign Team
          </Button>
        </div>
      )}

      <TicketList
        selectedTickets={selectedTickets}
        onSelectTicket={(ticketId) => {
          setSelectedTickets(prev => 
            prev.includes(ticketId)
              ? prev.filter(id => id !== ticketId)
              : [...prev, ticketId]
          )
        }}
        onSelectAll={setSelectedTickets}
      />

      <BulkStatusDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        ticketIds={selectedTickets}
        onUpdate={() => {
          setShowStatusDialog(false)
          setSelectedTickets([])
        }}
      />

      <BulkPriorityDialog
        isOpen={showPriorityDialog}
        onClose={() => setShowPriorityDialog(false)}
        ticketIds={selectedTickets}
        onUpdate={() => {
          setShowPriorityDialog(false)
          setSelectedTickets([])
        }}
      />

      <BulkAssignmentDialog
        isOpen={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        ticketIds={selectedTickets}
        onUpdate={() => {
          setShowAssignDialog(false)
          setSelectedTickets([])
        }}
      />
    </div>
  )
}
```

### 3. Filtered List with Search

```tsx
import { useState } from 'react'
import { TicketList } from '@/components/tickets/ticket-list'
import type { TicketFilters } from '@/types/models/ticket.types'

function FilteredTicketList() {
  const [filters, setFilters] = useState<TicketFilters>({})

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search tickets..."
          value={filters.search || ''}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            search: e.target.value
          }))}
        />
        
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({
            ...prev,
            status: value === 'all' ? undefined : value
          }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setFilters({})}
        >
          Clear Filters
        </Button>
      </div>

      <TicketList filters={filters} />
    </div>
  )
}
```

### 4. Team-Based Ticket View

```tsx
import { useTeam } from '@/hooks/teams/use-team'
import { TicketList } from '@/components/tickets/ticket-list'

function TeamTicketView({ teamId }: { teamId: string }) {
  const { team, isLoading } = useTeam(teamId)

  if (isLoading) {
    return <div>Loading team...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {team?.name} Tickets
      </h2>
      
      <TicketList
        filters={{ team_id: teamId }}
        isAdminView={false}
      />
    </div>
  )
}
```

## Advanced Usage Patterns

### 1. Real-time Updates with Subscriptions

```tsx
import { useTicketSubscription } from '@/hooks/tickets/use-ticket-subscription'
import { TicketList } from '@/components/tickets/ticket-list'
import { useToast } from '@/hooks/use-toast'

function LiveTicketList() {
  const { toast } = useToast()
  
  // Set up real-time subscription
  useTicketSubscription({
    onTicketCreated: (ticket) => {
      toast({
        title: 'New Ticket',
        description: `Ticket "${ticket.title}" has been created`
      })
    },
    onTicketUpdated: (ticket) => {
      toast({
        title: 'Ticket Updated',
        description: `Ticket "${ticket.title}" has been updated`
      })
    }
  })

  return <TicketList />
}
```

### 2. Custom Ticket Item Rendering

```tsx
import { TicketList } from '@/components/tickets/ticket-list'
import { TicketItem } from '@/components/tickets/ticket-item'
import type { Ticket } from '@/types/models/ticket.types'

function CustomTicketItem({ ticket }: { ticket: Ticket }) {
  return (
    <div className="p-4 border rounded-lg hover:shadow-md">
      <div className="flex justify-between">
        <h3 className="font-medium">{ticket.title}</h3>
        <div className="flex gap-2">
          <Badge>{ticket.status}</Badge>
          <Badge>{ticket.priority}</Badge>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {ticket.description}
      </p>
    </div>
  )
}

function CustomizedTicketList() {
  return (
    <TicketList
      renderItem={(ticket) => (
        <CustomTicketItem key={ticket.id} ticket={ticket} />
      )}
    />
  )
}
```

### 3. Integration with Forms

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CreateTicketForm } from '@/components/tickets/create-ticket-form'
import { TicketList } from '@/components/tickets/ticket-list'

const ticketSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category_id: z.string().optional(),
  team_id: z.string().optional()
})

function TicketCreationWithList() {
  const form = useForm({
    resolver: zodResolver(ticketSchema)
  })

  const onSubmit = async (data) => {
    // Handle ticket creation
  }

  return (
    <div className="space-y-8">
      <CreateTicketForm
        form={form}
        onSubmit={onSubmit}
      />
      
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">
          Your Tickets
        </h2>
        <TicketList />
      </div>
    </div>
  )
}
```

## Common Patterns and Best Practices

1. **State Management**
   - Keep selection state in parent component
   - Use controlled components for filters
   - Handle loading and error states

2. **Real-time Updates**
   - Use subscription hooks for live updates
   - Show toast notifications for changes
   - Update UI optimistically

3. **Performance**
   - Memoize callbacks and components
   - Use pagination for large lists
   - Implement infinite scroll for better UX

4. **Accessibility**
   - Maintain keyboard navigation
   - Use ARIA labels appropriately
   - Ensure proper focus management

5. **Error Handling**
   - Show user-friendly error messages
   - Provide retry mechanisms
   - Log errors for debugging
