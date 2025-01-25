-- Drop existing function
DROP FUNCTION IF EXISTS update_ticket_status(UUID, text, UUID);

-- Recreate function with correct parameter order
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_ticket_status(UUID, ticket_status, UUID) TO authenticated; 