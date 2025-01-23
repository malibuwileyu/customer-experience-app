# Database Schema Documentation

## Custom Types

### `ticket_status` (ENUM)
- `open`
- `in_progress`
- `resolved`
- `closed`

### `ticket_priority` (ENUM)
- `low`
- `medium`
- `high`
- `urgent`

### `user_role` (ENUM)
- `customer`
- `agent`
- `team_lead`
- `admin`
- `super_admin`

## Core Tables

### `profiles`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK to auth.users | User's unique identifier |
| `full_name` | TEXT | | User's full name |
| `avatar_url` | TEXT | | URL to user's avatar |
| `role` | TEXT | CHECK (role in ('admin', 'agent', 'customer')) | User's role |
| `preferences` | JSONB | DEFAULT '{}' | User preferences |
| `metadata` | JSONB | DEFAULT '{}' | Additional user metadata |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `last_seen_at` | TIMESTAMPTZ | | Last activity timestamp |

### `tickets`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Ticket's unique identifier |
| `title` | TEXT | NOT NULL | Ticket title |
| `description` | TEXT | NOT NULL | Ticket description |
| `status` | ticket_status | NOT NULL, DEFAULT 'open' | Current status |
| `priority` | ticket_priority | NOT NULL, DEFAULT 'medium' | Priority level |
| `created_by` | UUID | NOT NULL, FK to auth.users | Creator's ID |
| `assigned_to` | UUID | FK to auth.users | Assignee's ID |
| `team_id` | UUID | FK to teams | Assigned team's ID |
| `category_id` | UUID | FK to categories | Category ID |
| `tags` | TEXT[] | DEFAULT '{}' | Array of tags |
| `attachments` | JSONB[] | DEFAULT '{}' | Array of attachments |
| `metadata` | JSONB | DEFAULT '{}' | Additional metadata |
| `custom_fields` | JSONB | DEFAULT '{}' | Custom field values |
| `internal_notes` | TEXT[] | DEFAULT '{}' | Internal notes |
| `sla_due_at` | TIMESTAMPTZ | | SLA due date |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

### `ticket_comments`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Comment's unique identifier |
| `ticket_id` | UUID | NOT NULL, FK to tickets | Referenced ticket |
| `user_id` | UUID | NOT NULL, FK to auth.users | Comment author |
| `content` | TEXT | NOT NULL | Comment content |
| `parent_id` | UUID | FK to ticket_comments | Parent comment for threads |
| `attachments` | JSONB[] | DEFAULT '{}' | Array of attachments |
| `is_internal` | BOOLEAN | DEFAULT false | Internal note flag |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

## Role Management Tables

### `user_roles`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Role assignment ID |
| `user_id` | UUID | NOT NULL, FK to auth.users, UNIQUE | User ID |
| `role` | user_role | NOT NULL, DEFAULT 'customer' | Assigned role |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

### `permissions`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Permission ID |
| `name` | TEXT | NOT NULL, UNIQUE | Permission name |
| `description` | TEXT | | Permission description |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

### `role_permissions`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Role-permission mapping ID |
| `role` | user_role | NOT NULL | Role name |
| `permission_id` | UUID | NOT NULL, FK to permissions | Permission ID |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| UNIQUE(role, permission_id) | | | Prevents duplicate assignments |

## Audit Tables

### `ticket_status_history`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | History entry ID |
| `ticket_id` | UUID | NOT NULL, FK to tickets | Referenced ticket |
| `changed_by` | UUID | NOT NULL, FK to auth.users | User who made the change |
| `old_status` | ticket_status | | Previous status |
| `new_status` | ticket_status | NOT NULL | New status |
| `changed_at` | TIMESTAMPTZ | NOT NULL | Change timestamp |

### `ticket_assignment_history`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | History entry ID |
| `ticket_id` | UUID | NOT NULL, FK to tickets | Referenced ticket |
| `assigned_by` | UUID | NOT NULL, FK to auth.users | User who made the assignment |
| `old_assignee` | UUID | FK to auth.users | Previous assignee |
| `new_assignee` | UUID | FK to auth.users | New assignee |
| `assigned_at` | TIMESTAMPTZ | NOT NULL | Assignment timestamp |

### `role_audit_log`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Audit entry ID |
| `user_id` | UUID | NOT NULL, FK to auth.users | Affected user |
| `action` | TEXT | NOT NULL | Action performed |
| `old_role` | user_role | | Previous role |
| `new_role` | user_role | | New role |
| `performed_by` | UUID | NOT NULL, FK to auth.users | User who made the change |
| `created_at` | TIMESTAMPTZ | NOT NULL | Change timestamp |

## Configuration Tables

### `sla_configs`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Config ID |
| `name` | TEXT | NOT NULL | SLA name |
| `description` | TEXT | | SLA description |
| `priority` | ticket_priority | NOT NULL, UNIQUE | Associated priority |
| `response_time_hours` | INTEGER | NOT NULL | Expected response time |
| `resolution_time_hours` | INTEGER | NOT NULL | Expected resolution time |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

## Functions and Triggers

### Functions
1. `calculate_sla_due_date(p_priority ticket_priority)`
   - Calculates SLA due date based on ticket priority
   - Returns TIMESTAMPTZ

2. `set_sla_due_date()`
   - Trigger function to set SLA due date on ticket creation/update
   - Executed by trigger `set_ticket_sla_due_date`

3. `assign_ticket(p_ticket_id UUID, p_assigned_to UUID, p_assigned_by UUID)`
   - Assigns a ticket to a user and records the change
   - Returns SETOF tickets

4. `update_ticket_status(p_ticket_id UUID, p_new_status text, p_changed_by UUID)`
   - Updates ticket status and records the change
   - Returns SETOF tickets

5. `check_user_permission(user_id UUID, permission_name TEXT)`
   - Checks if a user has a specific permission
   - Returns BOOLEAN

### Triggers
1. `set_ticket_sla_due_date`
   - BEFORE INSERT OR UPDATE OF priority ON tickets
   - Sets SLA due date based on priority

2. `on_auth_user_created`
   - AFTER INSERT ON auth.users
   - Creates profile for new users

## Indexes
1. `idx_profiles_user_id` ON profiles(user_id)
2. `idx_user_roles_user_id` ON user_roles(user_id)
3. `idx_role_permissions_role` ON role_permissions(role)
4. `idx_role_permissions_permission` ON role_permissions(permission_id)
5. `idx_role_audit_log_user` ON role_audit_log(user_id)
6. `idx_role_audit_log_created` ON role_audit_log(created_at DESC)

## Row Level Security (RLS)
All tables have RLS enabled with appropriate policies for:
- Viewing
- Creating
- Updating
- Deleting

Policies are based on user roles and permissions, with specific rules for:
- Admins
- Team leads
- Agents
- Customers 