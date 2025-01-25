-- Create ticket_status_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS ticket_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    old_status ticket_status,
    new_status ticket_status NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Status history viewable by team members and ticket creators"
    ON ticket_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tickets t
            WHERE t.id = ticket_status_history.ticket_id
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ticket_status_history_ticket_id ON ticket_status_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_status_history_changed_by ON ticket_status_history(changed_by);

-- Drop and recreate the update_ticket_status function
DROP FUNCTION IF EXISTS update_ticket_status(UUID, ticket_status, UUID);

CREATE OR REPLACE FUNCTION update_ticket_status(
  p_ticket_id UUID,
  p_new_status ticket_status,
  p_changed_by UUID
) RETURNS SETOF tickets AS $$
DECLARE
  v_old_status ticket_status;
  v_ticket tickets%ROWTYPE;
BEGIN
  -- Check if the ticket exists
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN
    RAISE EXCEPTION 'Ticket does not exist';
  END IF;

  -- Get current status
  SELECT status INTO v_old_status
  FROM tickets
  WHERE id = p_ticket_id;

  -- Update ticket
  UPDATE tickets
  SET 
    status = p_new_status,
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
    p_new_status
  );

  RETURN NEXT v_ticket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON ticket_status_history TO authenticated;
GRANT EXECUTE ON FUNCTION update_ticket_status(UUID, ticket_status, UUID) TO authenticated; 