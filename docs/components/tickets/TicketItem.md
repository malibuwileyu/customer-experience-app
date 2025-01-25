# TicketItem Component

## Overview
The `TicketItem` component is a card-based display component for individual tickets. It provides a compact yet informative view of a ticket's key details, including title, description, status, priority, and assignment information. The component supports selection for bulk operations and navigation to ticket details or edit views.

## Props

```typescript
interface TicketItemProps {
  ticket: Ticket           // The ticket object to display
  selected?: boolean       // Whether the ticket is selected (for bulk operations)
  onSelect?: (ticketId: string) => void  // Callback when ticket selection changes
}
```

## Features

### Display Elements
- Title and truncated description
- Status badge with color coding
- Priority badge with color coding
- Assignee avatar (if assigned)
- Ticket ID and creation time
- Edit button

### Interactive Elements
- Checkbox for bulk selection
- Click to view ticket details
- Edit button for quick access to edit view
- Hover effects for better UX

### Visual Indicators
- Status colors:
  - Open: Blue
  - In Progress: Yellow
  - Resolved: Green
  - Closed: Gray
- Priority colors:
  - Low: Gray
  - Medium: Yellow
  - High: Orange
  - Urgent: Red

## Usage Example

```tsx
import { TicketItem } from '@/components/tickets/ticket-item'
import type { Ticket } from '@/types/models/ticket.types'

// Basic usage
<TicketItem ticket={ticket} />

// With selection
const [selectedTickets, setSelectedTickets] = useState<string[]>([])

<TicketItem
  ticket={ticket}
  selected={selectedTickets.includes(ticket.id)}
  onSelect={(ticketId) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    )
  }}
/>
```

## Dependencies

### Components
- `Card`, `Badge`, `Button`, `Avatar`, `Checkbox` from common components
- Uses React Router for navigation

### Utilities
- `date-fns` for relative time formatting

## Edge Cases & Limitations

1. **Description Handling**
   - Description is truncated to 2 lines using line-clamp
   - HTML in description is rendered as plain text
   - Long words may affect layout

2. **Avatar Display**
   - Shows only first letter of assignee ID
   - Falls back gracefully when no assignee
   - Limited to 8x8 size

3. **ID Display**
   - Shows only first 8 characters of UUID
   - May not be sufficient for disambiguation in large systems

## Accessibility

- Proper ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast meets WCAG guidelines
- Interactive elements have appropriate focus states

## Best Practices

1. **Event Handling**
   - Stops event propagation for checkbox clicks
   - Separates click handlers for different actions
   - Uses appropriate event types

2. **State Management**
   - Selection state managed by parent
   - Minimal internal state
   - Props for controlled behavior

3. **Styling**
   - Consistent spacing using Tailwind classes
   - Responsive layout
   - Clear visual hierarchy
   - Semantic HTML structure
