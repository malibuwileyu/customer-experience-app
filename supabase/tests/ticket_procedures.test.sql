BEGIN;

SELECT plan(12);

-- Insert test data
INSERT INTO teams (id, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Test Team', 'Test Team Description')
ON CONFLICT (id) DO NOTHING;

-- Insert and verify test users
DO $$
DECLARE
    admin_id UUID := '35238910-4dda-4041-abab-7f64a1a29cfb';
    agent_id UUID := '518a19bc-1d66-4e48-b018-fba996402887';
    customer_id UUID := '4a54fc65-1fa2-4ed8-8b12-2abb9ff2dc54';
    admin_exists BOOLEAN;
    agent_exists BOOLEAN;
    customer_exists BOOLEAN;
    ticket1_exists BOOLEAN;
BEGIN
    -- Verify users exist in auth.users
    SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_id) INTO admin_exists;
    SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = agent_id) INTO agent_exists;
    SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = customer_id) INTO customer_exists;

    -- Verify all required users exist before proceeding
    IF NOT (admin_exists AND agent_exists AND customer_exists) THEN
        RAISE EXCEPTION 'Not all required users exist in auth.users';
    END IF;

    -- Verify tickets table has sla_due_at column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'sla_due_at'
    ) THEN
        RAISE EXCEPTION 'tickets table is missing sla_due_at column';
    END IF;

    -- Now that we know users exist, ensure they have roles
    INSERT INTO user_roles (user_id, role)
    VALUES 
        (admin_id, 'admin'),
        (agent_id, 'agent'),
        (customer_id, 'customer')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = EXCLUDED.role;

    -- Verify users have roles
    IF NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id IN (admin_id, agent_id, customer_id)
        GROUP BY user_id 
        HAVING COUNT(*) = 1
    ) THEN
        RAISE EXCEPTION 'Not all users have roles';
    END IF;

    -- Insert team members
    INSERT INTO team_members (team_id, user_id, role)
    VALUES 
        ('11111111-1111-1111-1111-111111111111', admin_id, 'admin'),
        ('11111111-1111-1111-1111-111111111111', agent_id, 'agent')
    ON CONFLICT (team_id, user_id) DO NOTHING;

    -- Delete existing tickets to ensure clean state
    DELETE FROM tickets WHERE id IN (
        '55555555-5555-5555-5555-555555555555',
        '66666666-6666-6666-6666-666666666666'
    );
    
    -- Insert new tickets
    INSERT INTO tickets (id, title, description, team_id, created_by, status, priority)
    VALUES
        ('55555555-5555-5555-5555-555555555555', 'Test Ticket 1', 'Test Description 1', '11111111-1111-1111-1111-111111111111', customer_id, 'open', 'medium'),
        ('66666666-6666-6666-6666-666666666666', 'Test Ticket 2', 'Test Description 2', '11111111-1111-1111-1111-111111111111', customer_id, 'open', 'high');

    -- Verify ticket was inserted
    SELECT EXISTS (SELECT 1 FROM tickets WHERE id = '55555555-5555-5555-5555-555555555555') INTO ticket1_exists;
    IF NOT ticket1_exists THEN
        RAISE EXCEPTION 'Failed to insert test ticket';
    END IF;

    -- Store the user IDs for later use in tests
    PERFORM set_config('app.admin_id', admin_id::text, true);
    PERFORM set_config('app.agent_id', agent_id::text, true);
    PERFORM set_config('app.customer_id', customer_id::text, true);
END $$;

-- Test assign_ticket procedure
SELECT lives_ok(
    $$
    SELECT assign_ticket(
        '55555555-5555-5555-5555-555555555555',
        current_setting('app.agent_id')::uuid,
        current_setting('app.admin_id')::uuid
    );
    $$,
    'assign_ticket should execute successfully'
);

-- Verify the assignment
SELECT results_eq(
    $$
    SELECT assigned_to FROM tickets WHERE id = '55555555-5555-5555-5555-555555555555';
    $$,
    $$
    SELECT current_setting('app.agent_id')::uuid;
    $$,
    'Ticket should be assigned to the correct user'
);

SELECT results_eq(
    $$
    SELECT COUNT(*) FROM ticket_assignment_history 
    WHERE ticket_id = '55555555-5555-5555-5555-555555555555' 
    AND new_assignee = current_setting('app.agent_id')::uuid;
    $$,
    $$VALUES (1::bigint)$$,
    'assignment history should be recorded'
);

-- Test update_ticket_status procedure
SELECT lives_ok(
    $$
    SELECT update_ticket_status('55555555-5555-5555-5555-555555555555', 'in_progress', current_setting('app.agent_id')::uuid);
    $$,
    'update_ticket_status should execute successfully'
);

SELECT results_eq(
    $$
    SELECT status FROM tickets WHERE id = '55555555-5555-5555-5555-555555555555';
    $$,
    $$VALUES ('in_progress'::ticket_status)$$,
    'ticket status should be updated correctly'
);

SELECT results_eq(
    $$
    SELECT COUNT(*) FROM ticket_status_history 
    WHERE ticket_id = '55555555-5555-5555-5555-555555555555' 
    AND new_status = 'in_progress'::ticket_status;
    $$,
    $$VALUES (1::bigint)$$,
    'status history should be recorded'
);

-- Test calculate_sla_due_date function
SELECT results_eq(
    $$
    SELECT calculate_sla_due_date('urgent'::ticket_priority);
    $$,
    $$
    SELECT NOW() + INTERVAL '4 hours';
    $$,
    'SLA due date should be calculated correctly for urgent priority'
);

SELECT results_eq(
    $$
    SELECT calculate_sla_due_date('high'::ticket_priority);
    $$,
    $$
    SELECT NOW() + INTERVAL '8 hours';
    $$,
    'SLA due date should be calculated correctly for high priority'
);

-- Test SLA due date trigger
INSERT INTO tickets (
    id, 
    title, 
    description, 
    team_id, 
    created_by, 
    status, 
    priority
)
VALUES (
    '77777777-7777-7777-7777-777777777777',
    'Test SLA Ticket',
    'Test Description',
    '11111111-1111-1111-1111-111111111111',
    current_setting('app.customer_id')::uuid,
    'open',
    'urgent'
);

SELECT ok(
    (SELECT sla_due_at IS NOT NULL FROM tickets WHERE id = '77777777-7777-7777-7777-777777777777'),
    'SLA due date should be set automatically on ticket creation'
);

UPDATE tickets 
SET priority = 'high' 
WHERE id = '77777777-7777-7777-7777-777777777777';

SELECT ok(
    (
        SELECT sla_due_at > NOW() + INTERVAL '7 hours' 
        AND sla_due_at < NOW() + INTERVAL '9 hours'
        FROM tickets 
        WHERE id = '77777777-7777-7777-7777-777777777777'
    ),
    'SLA due date should be updated when priority changes'
);

-- Test error cases
SELECT throws_ok(
    $$
    SELECT assign_ticket('55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', current_setting('app.agent_id')::uuid);
    $$,
    'Assignee does not exist'
);

SELECT throws_ok(
    $$
    SELECT update_ticket_status('55555555-5555-5555-5555-555555555555', 'invalid_status', current_setting('app.agent_id')::uuid);
    $$,
    'Invalid status value'
);

-- Cleanup
SELECT * FROM finish();
ROLLBACK; 