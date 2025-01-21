-- Drop trigger
DROP TRIGGER IF EXISTS set_ticket_sla_due_date ON tickets;

-- Drop functions
DROP FUNCTION IF EXISTS set_sla_due_date();
DROP FUNCTION IF EXISTS calculate_sla_due_date(ticket_priority);
DROP FUNCTION IF EXISTS update_ticket_status(UUID, ticket_status, UUID);
DROP FUNCTION IF EXISTS assign_ticket(UUID, UUID, UUID); 