# Stored Procedures Documentation

## Overview
This document details the stored procedures used in the customer experience application. These procedures handle complex operations like user management, ticket operations, and team management.

## User Management Procedures

### handle_new_user
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
```

**Purpose**: Creates a new profile and user role entry when a user is created in auth.users.

**Trigger**: Executes AFTER INSERT ON auth.users

**Operations**:
1. Determines role from metadata (defaults to 'customer')
2. Creates profile entry with basic information
3. Creates user role entry

**Example Usage**:
```sql
-- Automatically triggered on user creation
INSERT INTO auth.users (email, password) VALUES ('user@example.com', 'password');
-- Triggers handle_new_user which creates profile and role
```

### sync_profile_email
```sql
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
```

**Purpose**: Keeps the email field in profiles synchronized with auth.users.

**Trigger**: Executes AFTER UPDATE OF email ON auth.users

**Operations**:
1. Checks if email has changed
2. Updates corresponding profile email

## Ticket Management Procedures

### update_ticket_status
```sql
CREATE OR REPLACE FUNCTION update_ticket_status(
  p_ticket_id UUID,
  p_new_status ticket_status,
  p_changed_by UUID
)
RETURNS tickets
LANGUAGE plpgsql
SECURITY DEFINER
```

**Purpose**: Updates a ticket's status and records the change in history.

**Parameters**:
- `p_ticket_id`: ID of the ticket to update
- `p_new_status`: New status to set
- `p_changed_by`: ID of the user making the change

**Returns**: Updated ticket record

**Operations**:
1. Verifies ticket exists
2. Records old status in history
3. Updates ticket status
4. Returns updated ticket

### update_ticket_attachments
```sql
CREATE OR REPLACE FUNCTION update_ticket_attachments(
  p_ticket_id UUID,
  p_attachments TEXT[]
)
RETURNS SETOF tickets
LANGUAGE plpgsql
SECURITY DEFINER
```

**Purpose**: Updates the attachments array for a ticket.

**Parameters**:
- `p_ticket_id`: ID of the ticket
- `p_attachments`: Array of attachment paths

**Returns**: Updated ticket record

**Operations**:
1. Verifies ticket exists
2. Updates attachments array
3. Returns updated ticket

### calculate_sla_due_date
```sql
CREATE OR REPLACE FUNCTION calculate_sla_due_date(
  p_priority ticket_priority
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
```

**Purpose**: Calculates the SLA due date based on ticket priority.

**Parameters**:
- `p_priority`: Priority level of the ticket

**Returns**: Calculated due date

**Operations**:
1. Retrieves SLA configuration for priority
2. Calculates due date based on resolution time
3. Returns calculated timestamp

## Team Management Procedures

### assign_team_lead
```sql
CREATE OR REPLACE FUNCTION assign_team_lead(
  p_team_id UUID,
  p_user_id UUID
)
RETURNS teams
LANGUAGE plpgsql
SECURITY DEFINER
```

**Purpose**: Assigns a team lead to a team, handling role updates.

**Parameters**:
- `p_team_id`: ID of the team
- `p_user_id`: ID of the user to make team lead

**Returns**: Updated team record

**Operations**:
1. Verifies user is not a customer
2. Updates team lead_id
3. Updates user role if necessary
4. Returns updated team

## Security Considerations

### SECURITY DEFINER Functions
The following functions run with elevated privileges:
- `handle_new_user`
- `sync_profile_email`
- `update_ticket_status`
- `update_ticket_attachments`
- `assign_team_lead`

These functions:
- Set search_path explicitly
- Use minimal required privileges
- Include proper error handling
- Validate inputs before operations

### Function Permissions
```sql
-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_ticket_status TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_sla_due_date TO authenticated;
GRANT EXECUTE ON FUNCTION update_ticket_attachments TO authenticated;
GRANT EXECUTE ON FUNCTION assign_team_lead TO authenticated;
```

## Error Handling

All procedures include:
- Input validation
- Existence checks
- Permission verification
- Proper error messages
- Transaction handling where needed

Example error handling:
```sql
IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN
    RAISE EXCEPTION 'Ticket does not exist';
END IF;
``` 