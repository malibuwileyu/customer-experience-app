# Database Schema Documentation

## Overview
The database schema is designed to support a customer experience application with ticket management, team collaboration, and role-based access control. The schema uses PostgreSQL with Supabase for authentication and storage.

## Core Types

### User Roles
```sql
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin',
  'team_lead',
  'agent',
  'customer'
);
```

### Ticket Status
```sql
CREATE TYPE ticket_status AS ENUM (
  'open',
  'in_progress',
  'resolved',
  'closed'
);
```

### Ticket Priority
```sql
CREATE TYPE ticket_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);
```

## Tables

### Profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  full_name TEXT,
  email TEXT NOT NULL REFERENCES auth.users(email),
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ
);
```

**Relationships:**
- One-to-one with `auth.users` through `id`
- Email reference to `auth.users`

**Indexes:**
- `idx_profiles_id` on `id`
- `idx_profiles_email` on `email`

### Teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Relationships:**
- One-to-many with `team_members`
- One-to-one with `auth.users` through `lead_id`

### Team Members
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'agent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
```

**Relationships:**
- Many-to-one with `teams`
- Many-to-one with `auth.users`

**Constraints:**
- Unique combination of `team_id` and `user_id`
- Prevents customers from being team members

### Tickets
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  category_id UUID REFERENCES categories(id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  attachments JSONB[] DEFAULT ARRAY[]::JSONB[],
  metadata JSONB DEFAULT '{}'::JSONB,
  custom_fields JSONB DEFAULT '{}'::JSONB,
  internal_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
  sla_due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Relationships:**
- Many-to-one with `auth.users` through `created_by` and `assigned_to`
- Many-to-one with `teams`
- Many-to-one with `categories`
- One-to-many with `ticket_comments`
- One-to-many with `ticket_status_history`
- One-to-many with `ticket_assignment_history`

**Indexes:**
- `idx_tickets_tags` on `tags` using GIN
- `idx_tickets_metadata` on `metadata` using GIN
- `idx_tickets_custom_fields` on `custom_fields` using GIN

### Ticket Comments
```sql
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES ticket_comments(id),
  attachments JSONB[] DEFAULT ARRAY[]::JSONB[],
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Relationships:**
- Many-to-one with `tickets`
- Many-to-one with `auth.users`
- Self-referential through `parent_id` for threaded comments

### Ticket Status History
```sql
CREATE TABLE ticket_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  old_status ticket_status,
  new_status ticket_status NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Relationships:**
- Many-to-one with `tickets`
- Many-to-one with `auth.users`

### Ticket Assignment History
```sql
CREATE TABLE ticket_assignment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  old_assignee UUID REFERENCES auth.users(id),
  new_assignee UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Relationships:**
- Many-to-one with `tickets`
- Many-to-one with `auth.users` (multiple references)

### SLA Configurations
```sql
CREATE TABLE sla_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  priority ticket_priority NOT NULL,
  response_time_hours INTEGER NOT NULL,
  resolution_time_hours INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(priority)
);
```

**Relationships:**
- Referenced by `tickets` through SLA calculations

## Storage

### Ticket Attachments Bucket
- Bucket ID: `ticket-attachments`
- Private bucket (not public)
- Files organized by ticket ID: `ticket-attachments/{ticketId}/{uuid}.{extension}`

## Triggers

### Profile Management
- `handle_new_user`: Creates profile entry when new user is created
- `sync_profile_email`: Keeps profile email in sync with auth.users

### SLA Management
- `calculate_sla_due_date`: Calculates SLA due date based on ticket priority

## Default Data

### SLA Configurations
```sql
INSERT INTO sla_configs (name, description, priority, response_time_hours, resolution_time_hours) 
VALUES 
  ('Urgent SLA', 'Critical issues requiring immediate attention', 'urgent', 1, 4),
  ('High Priority SLA', 'Important issues requiring quick resolution', 'high', 4, 8),
  ('Medium Priority SLA', 'Standard issues', 'medium', 8, 48),
  ('Low Priority SLA', 'Non-critical issues', 'low', 24, 72);
``` 