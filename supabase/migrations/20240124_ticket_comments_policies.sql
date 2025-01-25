-- Create policies for ticket_comments table

-- Allow users to view comments on tickets they have access to
CREATE POLICY "Users can view comments on accessible tickets"
ON ticket_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tickets t
    LEFT JOIN team_members tm ON t.team_id = tm.team_id
    WHERE t.id = ticket_comments.ticket_id
    AND (
      t.created_by = auth.uid() OR  -- Ticket creator
      t.assigned_to = auth.uid() OR  -- Assigned agent
      tm.user_id = auth.uid() OR     -- Team member
      EXISTS (                       -- Admin check
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    )
  )
);

-- Allow users to create comments on tickets they have access to
CREATE POLICY "Users can create comments on accessible tickets"
ON ticket_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tickets t
    LEFT JOIN team_members tm ON t.team_id = tm.team_id
    WHERE t.id = ticket_id
    AND (
      t.created_by = auth.uid() OR  -- Ticket creator
      t.assigned_to = auth.uid() OR  -- Assigned agent
      tm.user_id = auth.uid() OR     -- Team member
      EXISTS (                       -- Admin check
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    )
  )
);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments"
ON ticket_comments FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
ON ticket_comments FOR DELETE
USING (user_id = auth.uid());

-- Allow admins to manage all comments
CREATE POLICY "Admins can manage all comments"
ON ticket_comments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
); 