-- Drop triggers first
DROP TRIGGER IF EXISTS set_ticket_sla_due_date ON tickets;
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
DROP TRIGGER IF EXISTS update_ticket_comments_updated_at ON ticket_comments;
DROP TRIGGER IF EXISTS update_sla_configs_updated_at ON sla_configs;

-- Drop functions
DROP FUNCTION IF EXISTS set_sla_due_date();
DROP FUNCTION IF EXISTS calculate_sla_due_date(ticket_priority);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS sla_configs;
DROP TABLE IF EXISTS ticket_assignment_history;
DROP TABLE IF EXISTS ticket_status_history;
DROP TABLE IF EXISTS ticket_comments;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS teams;

-- Drop enums
DROP TYPE IF EXISTS ticket_status;
DROP TYPE IF EXISTS ticket_priority; 