-- Create custom types if they don't exist
DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop and recreate tables
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS ticket_status_history CASCADE;
DROP TABLE IF EXISTS ticket_assignment_history CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS sla_configs CASCADE;

-- Tickets table
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

-- Ticket comments table
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

-- Ticket status history for audit trail
CREATE TABLE ticket_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    old_status ticket_status,
    new_status ticket_status NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ticket assignment history
CREATE TABLE ticket_assignment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id),
    old_assignee UUID REFERENCES auth.users(id),
    new_assignee UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SLA configuration
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

-- Function to calculate SLA due date
CREATE OR REPLACE FUNCTION calculate_sla_due_date(
  p_priority ticket_priority
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_resolution_hours INTEGER;
BEGIN
  -- Get resolution time from SLA config
  SELECT resolution_time_hours INTO v_resolution_hours
  FROM sla_configs
  WHERE priority = p_priority;

  -- Return current timestamp plus resolution hours
  RETURN NOW() + (v_resolution_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to set SLA due date on ticket creation/update
CREATE OR REPLACE FUNCTION set_sla_due_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Set SLA due date for new tickets or when priority changes
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.priority IS DISTINCT FROM OLD.priority) THEN
    NEW.sla_due_at = calculate_sla_due_date(NEW.priority);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_ticket_sla_due_date ON tickets;

-- Add trigger for SLA due date
CREATE TRIGGER set_ticket_sla_due_date
  BEFORE INSERT OR UPDATE OF priority ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_sla_due_date();

-- Function to assign a ticket
CREATE OR REPLACE FUNCTION assign_ticket(
  p_ticket_id UUID,
  p_assigned_to UUID,
  p_assigned_by UUID
) RETURNS SETOF tickets AS $$
DECLARE
  v_old_assignee UUID;
  v_ticket tickets%ROWTYPE;
BEGIN
  -- Check if the ticket exists
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN
    RAISE EXCEPTION 'Ticket does not exist';
  END IF;

  -- Check if the assignee exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_assigned_to) THEN
    RAISE EXCEPTION 'Assignee does not exist';
  END IF;

  -- Get current assignee
  SELECT assigned_to INTO v_old_assignee
  FROM tickets
  WHERE id = p_ticket_id;

  -- Update ticket
  UPDATE tickets
  SET 
    assigned_to = p_assigned_to,
    updated_at = NOW()
  WHERE id = p_ticket_id
  RETURNING * INTO v_ticket;

  -- Record assignment history
  INSERT INTO ticket_assignment_history (
    ticket_id,
    assigned_by,
    old_assignee,
    new_assignee
  ) VALUES (
    p_ticket_id,
    p_assigned_by,
    v_old_assignee,
    p_assigned_to
  );

  RETURN NEXT v_ticket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update ticket status
CREATE OR REPLACE FUNCTION update_ticket_status(
  p_ticket_id UUID,
  p_new_status text,
  p_changed_by UUID
) RETURNS SETOF tickets AS $$
DECLARE
  v_old_status ticket_status;
  v_ticket tickets%ROWTYPE;
  v_new_status ticket_status;
BEGIN
  -- Check if the ticket exists
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN
    RAISE EXCEPTION 'Ticket does not exist';
  END IF;

  -- Check if the status is valid
  BEGIN
    v_new_status := p_new_status::ticket_status;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'Invalid status value';
  END;

  -- Get current status
  SELECT status INTO v_old_status
  FROM tickets
  WHERE id = p_ticket_id;

  -- Update ticket
  UPDATE tickets
  SET 
    status = v_new_status,
    updated_at = NOW()
  WHERE id = p_ticket_id
  RETURNING * INTO v_ticket;

  -- Record status history
  INSERT INTO ticket_status_history (
    ticket_id,
    changed_by,
    old_status,
    new_status
  ) VALUES (
    p_ticket_id,
    p_changed_by,
    v_old_status,
    v_new_status
  );

  RETURN NEXT v_ticket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default SLA configurations
INSERT INTO sla_configs (name, description, priority, response_time_hours, resolution_time_hours) 
VALUES 
    ('Urgent SLA', 'Critical issues requiring immediate attention', 'urgent', 1, 4),
    ('High Priority SLA', 'Important issues requiring quick resolution', 'high', 4, 8),
    ('Medium Priority SLA', 'Standard issues', 'medium', 8, 48),
    ('Low Priority SLA', 'Non-critical issues', 'low', 24, 72)
ON CONFLICT (priority) DO NOTHING;

-- RLS Policies
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_assignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tickets are viewable by team members and ticket creators" ON tickets;
DROP POLICY IF EXISTS "Tickets can be created by authenticated users" ON tickets;
DROP POLICY IF EXISTS "Tickets can be updated by assigned user, team members, or admin" ON tickets;

DROP POLICY IF EXISTS "Comments are viewable by team members and ticket creators" ON ticket_comments;
DROP POLICY IF EXISTS "Comments can be created by team members and ticket creators" ON ticket_comments;
DROP POLICY IF EXISTS "Comments can be updated by their authors" ON ticket_comments;

DROP POLICY IF EXISTS "Status history viewable by team members" ON ticket_status_history;
DROP POLICY IF EXISTS "Assignment history viewable by team members" ON ticket_assignment_history;
DROP POLICY IF EXISTS "SLA configs viewable by authenticated users" ON sla_configs;

-- Ticket policies
CREATE POLICY "Tickets are viewable by team members and ticket creators"
    ON tickets FOR SELECT
    USING (
        auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.user_id = auth.uid()
            AND tm.team_id = tickets.team_id
        )
    );

CREATE POLICY "Tickets can be created by authenticated users"
    ON tickets FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Tickets can be updated by assigned user, team members, or admin"
    ON tickets FOR UPDATE
    USING (
        auth.uid() = assigned_to 
        OR EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.user_id = auth.uid()
            AND tm.team_id = tickets.team_id
        )
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Comment policies
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

CREATE POLICY "Comments can be updated by their authors"
    ON ticket_comments FOR UPDATE
    USING (auth.uid() = user_id);

-- Status history viewable by team members
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

-- Assignment history viewable by team members
CREATE POLICY "Assignment history viewable by team members"
    ON ticket_assignment_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tickets t
            WHERE t.id = ticket_assignment_history.ticket_id
            AND EXISTS (
                SELECT 1 FROM team_members tm
                WHERE tm.user_id = auth.uid()
                AND tm.team_id = t.team_id
            )
        )
    );

-- SLA configs viewable by authenticated users
CREATE POLICY "SLA configs viewable by authenticated users"
    ON sla_configs FOR SELECT
    USING (auth.role() = 'authenticated');

-- Function to get tickets with all related data
CREATE OR REPLACE FUNCTION get_tickets(
  p_status text[] DEFAULT NULL,
  p_priority text[] DEFAULT NULL,
  p_team_id UUID DEFAULT NULL,
  p_search text DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status ticket_status,
  priority ticket_priority,
  created_by UUID,
  assigned_to UUID,
  team_id UUID,
  category_id UUID,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by_profile JSONB,
  assigned_to_profile JSONB,
  team JSONB,
  category JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.created_by,
    t.assigned_to,
    t.team_id,
    t.category_id,
    t.tags,
    t.created_at,
    t.updated_at,
    (
      SELECT jsonb_build_object(
        'id', p1.id,
        'full_name', p1.full_name,
        'avatar_url', p1.avatar_url
      )
      FROM profiles p1
      WHERE p1.id = t.created_by
    ) as created_by_profile,
    (
      SELECT jsonb_build_object(
        'id', p2.id,
        'full_name', p2.full_name,
        'avatar_url', p2.avatar_url
      )
      FROM profiles p2
      WHERE p2.id = t.assigned_to
    ) as assigned_to_profile,
    (
      SELECT jsonb_build_object(
        'id', tm.id,
        'name', tm.name
      )
      FROM teams tm
      WHERE tm.id = t.team_id
    ) as team,
    (
      SELECT jsonb_build_object(
        'id', c.id,
        'name', c.name
      )
      FROM categories c
      WHERE c.id = t.category_id
    ) as category
  FROM tickets t
  WHERE
    (p_status IS NULL OR t.status = ANY(p_status::ticket_status[]))
    AND (p_priority IS NULL OR t.priority = ANY(p_priority::ticket_priority[]))
    AND (p_team_id IS NULL OR t.team_id = p_team_id)
    AND (p_search IS NULL OR t.title ILIKE '%' || p_search || '%')
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_tickets TO authenticated;