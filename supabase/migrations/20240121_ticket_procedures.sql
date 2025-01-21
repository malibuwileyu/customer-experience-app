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
  p_new_status ticket_status,
  p_changed_by UUID
) RETURNS SETOF tickets AS $$
DECLARE
  v_old_status ticket_status;
  v_ticket tickets%ROWTYPE;
BEGIN
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