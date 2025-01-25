-- Add missing columns to tickets table if they don't exist
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS internal_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS attachments JSONB[] DEFAULT ARRAY[]::JSONB[];

-- Create storage bucket for ticket attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Function to update ticket attachments
CREATE OR REPLACE FUNCTION update_ticket_attachments(
  p_ticket_id UUID,
  p_attachments TEXT[]
)
RETURNS SETOF tickets
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_attachment_objects JSONB[];
  v_ticket tickets%ROWTYPE;
BEGIN
  -- Check if the ticket exists
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN
    RAISE EXCEPTION 'Ticket does not exist';
  END IF;

  -- Check if user has permission to update the ticket
  IF NOT EXISTS (
    SELECT 1 FROM tickets t
    LEFT JOIN team_members tm ON t.team_id = tm.team_id
    WHERE t.id = p_ticket_id
    AND (
      t.created_by = auth.uid() OR
      t.assigned_to = auth.uid() OR
      tm.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    )
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Convert text array of paths to array of JSONB objects
  SELECT array_agg(
    jsonb_build_object(
      'path', attachment,
      'name', split_part(attachment, '/', -1),
      'type', CASE 
        WHEN attachment LIKE '%.pdf' THEN 'application/pdf'
        WHEN attachment LIKE '%.png' THEN 'image/png'
        WHEN attachment LIKE '%.jpg' THEN 'image/jpeg'
        WHEN attachment LIKE '%.jpeg' THEN 'image/jpeg'
        ELSE 'application/octet-stream'
      END,
      'created_at', NOW()
    )
  )
  INTO v_attachment_objects
  FROM unnest(p_attachments) AS attachment;

  -- Update ticket
  UPDATE tickets
  SET 
    attachments = COALESCE(v_attachment_objects, ARRAY[]::JSONB[]),
    updated_at = NOW()
  WHERE id = p_ticket_id
  RETURNING * INTO v_ticket;

  RETURN NEXT v_ticket;
END;
$$;

-- Create RLS policies for tickets table
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Agents can view assigned tickets" ON tickets;
DROP POLICY IF EXISTS "Team members can view team tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON tickets;
DROP POLICY IF EXISTS "Agents can update assigned tickets" on tickets;
DROP POLICY IF EXISTS "Admins can delete tickets" on tickets;
DROP POLICY IF EXISTS "Users can upload ticket attachments" on storage.objects;
DROP POLICY IF EXISTS "Users can view ticket attachments" on storage.objects;
DROP POLICY IF EXISTS "Users can delete their own attachments" on storage.objects;

-- View policies
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

-- Insert policies

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

-- Update policies
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
)
WITH CHECK (
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

-- Delete policies
CREATE POLICY "Admins can delete tickets"
ON tickets FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Storage policies for ticket attachments
CREATE POLICY "Users can upload ticket attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-attachments'
  AND (
    EXISTS (
      SELECT 1 FROM tickets t
      LEFT JOIN team_members tm ON t.team_id = tm.team_id
      WHERE t.id::text = (storage.foldername(name))[1]
      AND (
        t.created_by = auth.uid() OR
        t.assigned_to = auth.uid() OR
        tm.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role = 'admin'
        )
      )
    )
  )
);

CREATE POLICY "Users can view ticket attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ticket-attachments'
  AND (
    EXISTS (
      SELECT 1 FROM tickets t
      LEFT JOIN team_members tm ON t.team_id = tm.team_id
      WHERE t.id::text = (storage.foldername(name))[1]
      AND (
        t.created_by = auth.uid() OR
        t.assigned_to = auth.uid() OR
        tm.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role = 'admin'
        )
      )
    )
  )
);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ticket-attachments'
  AND (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id::text = (storage.foldername(name))[1]
      AND t.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_tickets_tags ON tickets USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_tickets_metadata ON tickets USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_tickets_custom_fields ON tickets USING gin(custom_fields); 