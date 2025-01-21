-- Reset tables
TRUNCATE TABLE 
  ticket_comments,
  ticket_status_history,
  ticket_assignment_history,
  tickets,
  team_members,
  teams,
  users
CASCADE;

-- Insert test users
INSERT INTO users (id, email)
VALUES 
  ('user-123', 'user1@test.com'),
  ('user-456', 'user2@test.com'),
  ('user-789', 'user3@test.com'),
  ('admin-123', 'admin@test.com');

-- Insert test teams
INSERT INTO teams (id, name, description, lead_id)
VALUES 
  ('team-123', 'Support Team A', 'Primary support team', 'user-456'),
  ('team-456', 'Support Team B', 'Secondary support team', 'user-789');

-- Insert team members
INSERT INTO team_members (team_id, user_id, role)
VALUES 
  ('team-123', 'user-123', 'member'),
  ('team-123', 'user-456', 'lead'),
  ('team-456', 'user-789', 'lead'),
  ('team-456', 'user-123', 'member');

-- Insert test tickets
INSERT INTO tickets (
  id, 
  title, 
  description, 
  status, 
  priority,
  created_by,
  team_id,
  assignee_id
)
VALUES 
  (
    'ticket-123',
    'Test Ticket 1',
    'Test Description 1',
    'open',
    'medium',
    'user-123',
    'team-123',
    'user-456'
  ),
  (
    'ticket-456',
    'Test Ticket 2',
    'Test Description 2',
    'in_progress',
    'high',
    'user-123',
    'team-456',
    'user-789'
  ),
  (
    'ticket-789',
    'Test Ticket 3',
    'Test Description 3',
    'open',
    'urgent',
    'user-456',
    'team-123',
    NULL
  );

-- Insert test ticket comments
INSERT INTO ticket_comments (
  ticket_id,
  user_id,
  content,
  is_internal
)
VALUES 
  ('ticket-123', 'user-456', 'Test comment 1', false),
  ('ticket-123', 'user-456', 'Internal note 1', true),
  ('ticket-456', 'user-789', 'Test comment 2', false);

-- Insert test ticket status history
INSERT INTO ticket_status_history (
  ticket_id,
  old_status,
  new_status,
  changed_by
)
VALUES 
  ('ticket-456', 'open', 'in_progress', 'user-789');

-- Insert test ticket assignment history
INSERT INTO ticket_assignment_history (
  ticket_id,
  old_assignee,
  new_assignee,
  assigned_by
)
VALUES 
  ('ticket-123', NULL, 'user-456', 'user-123'); 