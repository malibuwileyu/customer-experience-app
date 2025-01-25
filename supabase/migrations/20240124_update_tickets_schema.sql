-- Add missing columns to tickets table
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS internal_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS attachments JSONB[] DEFAULT ARRAY[]::JSONB[];

-- Create RLS policies for tickets table
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Agents can view assigned tickets" ON tickets;
DROP POLICY IF EXISTS "Team members can view team tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON tickets;

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

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_tickets_tags ON tickets USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_tickets_metadata ON tickets USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_tickets_custom_fields ON tickets USING gin(custom_fields); 