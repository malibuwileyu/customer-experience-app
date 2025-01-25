# Bulk Operations

## Overview
The bulk operations system enables efficient management of multiple tickets simultaneously. It provides features for batch updates to ticket status, priority, team assignment, and deletion, with role-based access control and proper error handling.

## Core Features

### 1. Bulk Status Updates
- Update status of multiple tickets
- Validate status transitions
- Track status history
- Role-based permissions

### 2. Bulk Team Assignment
- Assign multiple tickets to teams
- Track assignment history
- Team lead notifications
- Role-based access control

### 3. Bulk Priority Changes
- Update priority of multiple tickets
- Recalculate SLA deadlines
- Track priority history
- Permission validation

### 4. Bulk Deletion
- Delete multiple tickets
- Admin-only operation
- Permanent deletion
- Audit logging

## Role-Based Access

### Admin
- Access to all bulk operations
- Can delete tickets
- No team restrictions
- Full permission set

### Team Lead
- Bulk status updates for team tickets
- Bulk priority changes for team tickets
- Bulk team assignment within team
- Cannot perform bulk deletion

### Agent
- Limited bulk status updates
- No bulk priority changes
- No bulk team assignment
- No bulk deletion

### Customer
- No access to bulk operations
- Can only view own tickets
- No modification permissions
- No deletion rights

## Usage Examples

### Bulk Status Update
```typescript
const { bulkUpdateStatus } = useBulkOperations();

// Update multiple tickets to "in_progress"
await bulkUpdateStatus({
  ticketIds: ["id1", "id2", "id3"],
  newStatus: "in_progress"
});
```

### Bulk Team Assignment
```typescript
const { bulkAssignTeam } = useBulkOperations();

// Assign multiple tickets to a team
await bulkAssignTeam({
  ticketIds: ["id1", "id2", "id3"],
  teamId: "team123"
});
```

### Bulk Priority Update
```typescript
const { bulkUpdatePriority } = useBulkOperations();

// Update multiple tickets to high priority
await bulkUpdatePriority({
  ticketIds: ["id1", "id2", "id3"],
  newPriority: "high"
});
```

### Bulk Deletion
```typescript
const { bulkDeleteTickets } = useBulkOperations();

// Delete multiple tickets (admin only)
await bulkDeleteTickets({
  ticketIds: ["id1", "id2", "id3"]
});
```

## Error Handling

### Common Errors
1. **Permission Errors**
   - Unauthorized operation
   - Invalid role for action
   - Team access restrictions

2. **Validation Errors**
   - Invalid status transitions
   - Invalid priority levels
   - Invalid team assignments

3. **Operation Errors**
   - Partial operation failure
   - Network issues
   - Concurrent modification

### Error Responses
```typescript
interface BulkOperationError {
  code: string;
  message: string;
  details?: {
    failedTickets?: string[];
    successfulTickets?: string[];
    errorType?: string;
    reason?: string;
  };
}

// Example error
{
  code: "BULK_UPDATE_PARTIAL_FAILURE",
  message: "Some tickets could not be updated",
  details: {
    failedTickets: ["id2", "id3"],
    successfulTickets: ["id1"],
    errorType: "PERMISSION_ERROR",
    reason: "Insufficient permissions for some tickets"
  }
}
```

## Performance Considerations
- Batch database operations
- Concurrent processing
- Progress tracking
- Operation timeouts

## Security
- Role validation
- Team access checks
- Audit logging
- Operation limits

## Related Components
- `BulkActionMenu`: Menu for bulk operations
- `BulkStatusDialog`: Status update interface
- `BulkAssignmentDialog`: Team assignment interface
- `BulkDeleteDialog`: Deletion confirmation

## Database Functions
```sql
-- Bulk status update function
CREATE OR REPLACE FUNCTION update_ticket_status_bulk(
  p_ticket_ids UUID[],
  p_new_status ticket_status,
  p_changed_by UUID
) RETURNS SETOF UUID AS $$
DECLARE
  v_ticket_id UUID;
BEGIN
  FOREACH v_ticket_id IN ARRAY p_ticket_ids
  LOOP
    -- Update status and record history
    INSERT INTO ticket_status_history (
      ticket_id, old_status, new_status, changed_by
    )
    SELECT 
      v_ticket_id,
      status,
      p_new_status,
      p_changed_by
    FROM tickets
    WHERE id = v_ticket_id;

    UPDATE tickets
    SET status = p_new_status
    WHERE id = v_ticket_id;

    RETURN NEXT v_ticket_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## API Endpoints
- `POST /tickets/bulk/status`: Update status
- `POST /tickets/bulk/team`: Assign team
- `POST /tickets/bulk/priority`: Update priority
- `DELETE /tickets/bulk`: Delete tickets

## UI/UX Considerations
- Clear selection indicators
- Progress feedback
- Confirmation dialogs
- Error notifications

## See Also
- [Ticket Management](./ticket-management.md)
- [Team Management](./team-management.md)
- [Role-Based Access Control](./rbac.md) 