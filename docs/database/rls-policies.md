# Row Level Security (RLS) Policies

## Overview
Row Level Security (RLS) policies control access to table rows based on user roles and relationships. These policies ensure data security and proper access control at the database level.

## Table Policies

### Profiles Table

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- View Policy
CREATE POLICY "Users can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);  -- Allow viewing all profiles for team management
```

### Teams Table

```sql
-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- View Policy
CREATE POLICY "Enable read access for authenticated users"
ON teams FOR SELECT
TO authenticated
USING (true);

-- Insert Policy
CREATE POLICY "Enable insert for admins"
ON teams FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'super_admin')
  )
);

-- Update Policy
CREATE POLICY "Enable update for admins and team leads"
ON teams FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'super_admin')
  ) OR 
  (auth.uid() = lead_id)
);

-- Delete Policy
CREATE POLICY "Enable delete for admins"
ON teams FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'super_admin')
  )
);
```

### Team Members Table

```sql
-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Constraint
ALTER TABLE team_members
ADD CONSTRAINT prevent_customer_team_members
CHECK (
  NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role = 'customer'
  )
);
```

### Tickets Table

```sql
-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- View Policies
CREATE POLICY "Users can view their own tickets"
ON tickets FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Agents can view assigned tickets"
ON tickets FOR SELECT
USING (
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('agent', 'admin')
  )
);

CREATE POLICY "Team members can view team tickets"
ON tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = tickets.team_id
    AND user_id = auth.uid()
  )
);

-- Insert Policy
CREATE POLICY "Users can create tickets"
ON tickets FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  (
    -- Regular users can only create tickets without team assignment
    (
      NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('agent', 'admin')
      ) AND team_id IS NULL
    ) OR
    -- Agents and admins can create tickets with team assignment
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('agent', 'admin')
    )
  )
);

-- Update Policy
CREATE POLICY "Agents can update assigned tickets"
ON tickets FOR UPDATE
USING (
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = tickets.team_id
    AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Delete Policy
CREATE POLICY "Admins can delete tickets"
ON tickets FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

### Ticket Comments Table

```sql
-- Enable RLS
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- View Policy
CREATE POLICY "Comments are viewable by team members and ticket creators"
ON ticket_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = ticket_comments.ticket_id
    AND (
      t.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.team_id = t.team_id
      )
    )
  )
);

-- Insert Policy
CREATE POLICY "Comments can be created by team members and ticket creators"
ON ticket_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = ticket_id
    AND (
      t.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.team_id = t.team_id
      )
    )
  )
);

-- Update Policy
CREATE POLICY "Comments can be updated by their authors"
ON ticket_comments FOR UPDATE
USING (auth.uid() = user_id);
```

### Ticket Status History Table

```sql
-- Enable RLS
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;

-- View Policy
CREATE POLICY "Status history viewable by team members"
ON ticket_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = ticket_status_history.ticket_id
    AND EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.team_id = t.team_id
    )
  )
);
```

### Storage Objects (Ticket Attachments)

```sql
-- View Policy
CREATE POLICY "Users can view ticket attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ticket-attachments' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id::text = (storage.foldername(name))[1]
    AND (
      t.created_by = auth.uid() OR -- ticket creator
      t.assigned_to = auth.uid() OR -- assigned agent
      EXISTS ( -- team member
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = t.team_id
        AND tm.user_id = auth.uid()
      )
    )
  )
);

-- Delete Policy
CREATE POLICY "Users can delete ticket attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ticket-attachments' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id::text = (storage.foldername(name))[1]
    AND (
      t.created_by = auth.uid() OR -- ticket creator
      t.assigned_to = auth.uid() OR -- assigned agent
      EXISTS ( -- team member
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = t.team_id
        AND tm.user_id = auth.uid()
      )
    )
  )
);
```

## Role-Based Access Summary

### Super Admin & Admin
- Full access to all teams
- Can create, update, and delete teams
- Can manage team members
- Can delete tickets
- Can view all tickets and comments
- Can manage attachments

### Team Lead
- Can update their own team
- Can manage team members
- Can view and update team tickets
- Can manage team ticket attachments

### Agent
- Can view assigned tickets
- Can update assigned tickets
- Can view and create team tickets
- Can manage ticket attachments for assigned tickets

### Customer
- Can view and create their own tickets
- Can view and add comments to their tickets
- Can manage attachments for their tickets
- Cannot be team members 