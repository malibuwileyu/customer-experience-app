# Ticket Management

## Overview
The ticket management system enables users to create, track, and manage support tickets based on their roles. It includes features for ticket creation, status updates, priority management, team assignment, and file attachments.

## Core Features

### 1. Ticket Creation
- Create tickets with title, description, and priority
- Attach files (images, PDFs, documents)
- Automatic SLA calculation based on priority
- Initial status set to "Open"

### 2. Ticket Updates
- Update ticket status (Open, In Progress, Resolved, Closed)
- Modify priority levels
- Add comments and internal notes
- Track status history and assignment changes

### 3. Team Assignment
- Assign tickets to specific teams
- Automatic notification of team leads
- Track assignment history
- Role-based assignment permissions

### 4. File Management
- Upload multiple files (max 50MB per file)
- Supported formats: images, PDFs, documents, text files
- Secure file storage and access control
- Download and preview capabilities

### 5. Bulk Operations
- Select multiple tickets for batch operations
- Bulk status updates
- Bulk team assignment
- Bulk priority changes
- Bulk deletion (admin only)

## Role-Based Access

### Admin
- Full access to all tickets
- Can perform all operations
- Access to bulk operations
- Can delete tickets

### Team Lead
- View team's tickets
- Assign tickets within team
- Update ticket status and priority
- Cannot delete tickets

### Agent
- View assigned tickets
- Update ticket status
- Add comments
- Upload attachments

### Customer
- Create new tickets
- View own tickets
- Add comments
- Upload attachments

## Usage Examples

### Creating a Ticket
```typescript
const { createTicket } = useCreateTicket();

// Basic ticket creation
await createTicket({
  title: "Login Issue",
  description: "Unable to access account",
  priority: "high"
});

// With attachments
await createTicket({
  title: "Bug Report",
  description: "Application crash",
  priority: "critical",
  attachments: [file1, file2]
});
```

### Updating Ticket Status
```typescript
const { updateTicketStatus } = useTicketUpdate();

await updateTicketStatus(ticketId, "in_progress");
```

### Bulk Operations
```typescript
const { bulkUpdateStatus } = useBulkOperations();

// Update multiple tickets
await bulkUpdateStatus({
  ticketIds: ["id1", "id2", "id3"],
  newStatus: "resolved"
});
```

## Error Handling

### Common Errors
1. **File Upload Errors**
   - File size exceeds limit
   - Unsupported file type
   - Upload failed

2. **Permission Errors**
   - Unauthorized access
   - Invalid role for operation
   - Missing team membership

3. **Validation Errors**
   - Missing required fields
   - Invalid status transition
   - Invalid priority level

### Error Responses
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Example error
{
  code: "UNAUTHORIZED",
  message: "You do not have permission to perform this action",
  details: {
    requiredRole: "admin",
    currentRole: "agent"
  }
}
```

## Real-time Updates
- Automatic UI updates on ticket changes
- Real-time status updates
- Instant comment notifications
- Team assignment notifications

## Performance Considerations
- Pagination for ticket lists (50 items per page)
- Cached query results (5 minutes)
- Optimistic updates for better UX
- Debounced search operations

## Security
- Role-based access control
- Secure file storage
- Audit logging for changes
- Input sanitization

## Related Components
- `TicketList`: Displays ticket list with filters
- `TicketDetails`: Shows detailed ticket information
- `TicketForm`: Form for creating/editing tickets
- `BulkActionDialog`: Interface for bulk operations

## Database Tables
- `tickets`: Main ticket information
- `ticket_comments`: Ticket comments and notes
- `ticket_status_history`: Status change history
- `ticket_assignment_history`: Assignment tracking

## API Endpoints
- `POST /tickets`: Create new ticket
- `GET /tickets`: List tickets
- `PUT /tickets/:id`: Update ticket
- `DELETE /tickets/:id`: Delete ticket
- `POST /tickets/bulk`: Bulk operations

## See Also
- [Team Management](./team-management.md)
- [File Management](./file-management.md)
- [Role-Based Access Control](./rbac.md) 