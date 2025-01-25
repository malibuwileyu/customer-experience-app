-- Ensure teams table exists and has RLS enabled
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    lead_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create team_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'agent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Teams can be created by authenticated users" ON teams;
DROP POLICY IF EXISTS "Teams are viewable by team members and admins" ON teams;
DROP POLICY IF EXISTS "Teams can be updated by admins and team leads" ON teams;
DROP POLICY IF EXISTS "Teams can be deleted by admins" ON teams;
DROP POLICY IF EXISTS "Team members can be managed by admins and team leads" ON team_members;

-- Create simplified team policies
CREATE POLICY "Enable read access for authenticated users"
ON teams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for admins"
ON teams FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Enable update for admins and team leads"
ON teams FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'super_admin')
  ) OR 
  (auth.uid() = lead_id)
);

CREATE POLICY "Enable delete for admins"
ON teams FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'super_admin')
  )
);

-- Create simplified team members policy
CREATE POLICY "Enable all for admins and team leads"
ON team_members FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'super_admin')
  ) OR
  auth.uid() IN (
    SELECT lead_id FROM teams 
    WHERE id = team_members.team_id
  )
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON team_members TO authenticated; 