-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Teams can be created by authenticated users" ON teams;

-- Create policy for team creation
CREATE POLICY "Teams can be created by authenticated users"
ON teams FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Update existing view policy to include admins
DROP POLICY IF EXISTS "Teams are viewable by team members" ON teams;

CREATE POLICY "Teams are viewable by team members and admins"
ON teams FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.team_id = teams.id
  ) OR
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
); 