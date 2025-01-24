-- Drop existing policy
DROP POLICY IF EXISTS "Tickets are viewable by team members and ticket creators" ON tickets;

-- Create updated policy that includes admin and agent access
CREATE POLICY "Tickets are viewable by admins, agents, team members and creators"
    ON tickets FOR SELECT
    USING (
        -- Allow admins and agents to see all tickets
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND ur.role IN ('admin', 'agent')
        )
        -- Allow ticket creators to see their tickets
        OR auth.uid() = created_by
        -- Allow team members to see their team's tickets
        OR EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.user_id = auth.uid()
            AND tm.team_id = tickets.team_id
        )
    ); 