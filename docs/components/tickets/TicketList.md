# TicketList Component

## Overview
The `TicketList` component is a core component that displays a list of tickets with filtering, search, and bulk selection capabilities. It supports both admin and regular user views, with real-time updates through Supabase subscriptions.

## Props

```typescript
interface TicketListProps {
  selectedTickets?: string[]           // Array of selected ticket IDs
  onSelectTicket?: (ticketId: string) => void  // Callback when a ticket is selected
  onSelectAll?: (ticketIds: string[]) => void  // Callback when all tickets are selected/deselected
  isAdminView?: boolean               // Toggle between admin and regular user view
}
```

## Features

### Real-time Updates
- Utilizes `useTicketSubscription` hook for live updates
- Automatically refreshes when tickets are created, updated, or deleted

### Filtering Capabilities
- Search by text
- Filter by status (open, in_progress, resolved, closed)
- Filter by priority (low, medium, high, urgent)
- Clear all filters option

### Bulk Selection
- Select individual tickets
- Select/deselect all tickets on the current page
- Maintains selection state across filter changes

### Loading States
- Shows skeleton loading state while fetching tickets
- Displays error message if loading fails
- Shows "No tickets found" message for empty results

## Usage Example

```tsx
import { TicketList } from '@/components/tickets/ticket-list'

// Basic usage
<TicketList />

// With bulk selection
const [selectedTickets, setSelectedTickets] = useState<string[]>([])

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

// Admin view
<TicketList isAdminView={true} />
```

## Dependencies

### Components
- `Card`, `Input`, `Select`, `Button`, `Skeleton`, `Alert`, `Checkbox` from common components
- `TicketItem` for individual ticket rendering

### Hooks
- `useTickets` - Regular ticket fetching
- `useAllTickets` - Admin ticket fetching
- `useTicketSubscription` - Real-time updates

## Edge Cases & Limitations

1. **Selection State**
   - Selection is maintained when filters change
   - Selection is cleared when component unmounts
   - Maximum selection limit depends on parent component

2. **Filter Behavior**
   - Filters are combined with AND logic
   - Empty search term shows all tickets
   - Filters are reset when switching between admin/user views

3. **Performance**
   - Optimized for lists up to 100 tickets
   - Uses pagination through the backend
   - Real-time updates may cause brief UI flickers

## Accessibility

- Proper ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly status messages
- High contrast visual indicators for selection

## Best Practices

1. **State Management**
   - Keep selection state in parent component
   - Use memoization for large lists
   - Handle loading and error states appropriately

2. **Event Handling**
   - Debounce search input changes
   - Batch selection updates
   - Prevent unnecessary re-renders

3. **Styling**
   - Uses Tailwind CSS for responsive design
   - Follows design system spacing
   - Maintains consistent component hierarchy
