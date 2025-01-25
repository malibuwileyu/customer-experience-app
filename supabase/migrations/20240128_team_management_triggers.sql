-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_team_lead_change ON teams;
DROP TRIGGER IF EXISTS on_team_member_role_change ON team_members;
DROP TRIGGER IF EXISTS enforce_single_team_lead ON teams;

-- Create function to handle team lead changes
CREATE OR REPLACE FUNCTION handle_team_lead_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role;
BEGIN
  -- If lead_id is being set or changed
  IF (TG_OP = 'INSERT' AND NEW.lead_id IS NOT NULL) OR 
     (TG_OP = 'UPDATE' AND NEW.lead_id IS DISTINCT FROM OLD.lead_id) THEN
    
    -- Get the user's current role
    SELECT role::user_role INTO v_role
    FROM profiles 
    WHERE id = NEW.lead_id;

    -- Verify the new lead is not a customer
    IF v_role = 'customer'::user_role THEN
      RAISE EXCEPTION 'Customers cannot be team leads';
    END IF;

    -- If the new lead is an agent, promote them to team_lead
    IF v_role = 'agent'::user_role THEN
      -- Update profile
      UPDATE profiles 
      SET role = 'team_lead'::user_role
      WHERE id = NEW.lead_id;

      -- Update user_roles
      UPDATE user_roles
      SET role = 'team_lead'::user_role
      WHERE user_id = NEW.lead_id;
    END IF;

    -- Ensure they are a team member with team_lead role
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (NEW.id, NEW.lead_id, 'team_lead'::user_role)
    ON CONFLICT (team_id, user_id) 
    DO UPDATE SET role = 'team_lead'::user_role;
  END IF;

  -- If lead_id is being removed or changed
  IF TG_OP = 'UPDATE' AND OLD.lead_id IS NOT NULL AND 
     (NEW.lead_id IS NULL OR NEW.lead_id != OLD.lead_id) THEN
    
    -- Get the old lead's current role
    SELECT role::user_role INTO v_role
    FROM profiles 
    WHERE id = OLD.lead_id;
    
    -- If old lead was a team_lead (not admin), demote them back to agent
    -- Only if they don't lead any other teams
    IF v_role = 'team_lead'::user_role AND NOT EXISTS (
      SELECT 1 FROM teams 
      WHERE lead_id = OLD.lead_id 
      AND id != OLD.id
    ) THEN
      -- Update profile
      UPDATE profiles 
      SET role = 'agent'::user_role
      WHERE id = OLD.lead_id;

      -- Update user_roles
      UPDATE user_roles
      SET role = 'agent'::user_role
      WHERE user_id = OLD.lead_id;
    END IF;
    
    -- Update their team member role to agent
    UPDATE team_members
    SET role = 'agent'::user_role
    WHERE team_id = OLD.id 
    AND user_id = OLD.lead_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create function to handle team member role changes
CREATE OR REPLACE FUNCTION handle_team_member_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role;
BEGIN
  -- Get the user's current role
  SELECT role::user_role INTO v_role
  FROM profiles 
  WHERE id = NEW.user_id;

  -- Verify the user is not a customer
  IF v_role = 'customer'::user_role THEN
    RAISE EXCEPTION 'Customers cannot be team members';
  END IF;

  -- If being made team_lead, update their profile role if they're an agent
  IF NEW.role::user_role = 'team_lead'::user_role AND v_role = 'agent'::user_role THEN
    -- Update profile
    UPDATE profiles 
    SET role = 'team_lead'::user_role
    WHERE id = NEW.user_id;

    -- Update user_roles
    UPDATE user_roles
    SET role = 'team_lead'::user_role
    WHERE user_id = NEW.user_id;
  END IF;

  -- If being demoted from team_lead, update their profile role to agent
  -- unless they are a lead of another team
  IF TG_OP = 'UPDATE' AND 
     OLD.role::user_role = 'team_lead'::user_role AND 
     NEW.role::user_role != 'team_lead'::user_role AND 
     v_role = 'team_lead'::user_role THEN
    
    IF NOT EXISTS (
      SELECT 1 FROM teams
      WHERE lead_id = NEW.user_id
    ) THEN
      -- Update profile
      UPDATE profiles 
      SET role = 'agent'::user_role
      WHERE id = NEW.user_id;

      -- Update user_roles
      UPDATE user_roles
      SET role = 'agent'::user_role
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create function to enforce single team lead
CREATE OR REPLACE FUNCTION enforce_single_team_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.lead_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM teams
    WHERE lead_id = NEW.lead_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'A user cannot lead multiple teams';
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_team_lead_change
  AFTER INSERT OR UPDATE OF lead_id ON teams
  FOR EACH ROW
  EXECUTE FUNCTION handle_team_lead_change();

CREATE TRIGGER on_team_member_role_change
  BEFORE INSERT OR UPDATE OF role ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_team_member_role_change();

CREATE TRIGGER enforce_single_team_lead
  BEFORE INSERT OR UPDATE OF lead_id ON teams
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_team_lead();

-- Update team policies
DROP POLICY IF EXISTS "Teams can be updated by admins and team leads" ON teams;
CREATE POLICY "Teams can be updated by admins and team leads"
ON teams FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND (p.role::user_role = 'admin'::user_role OR (p.role::user_role = 'team_lead'::user_role AND teams.lead_id = p.id))
  )
);

-- Update team members policies
DROP POLICY IF EXISTS "Team members can be managed by admins and team leads" ON team_members;
CREATE POLICY "Team members can be managed by admins and team leads"
ON team_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND (
      p.role::user_role = 'admin'::user_role OR 
      (p.role::user_role = 'team_lead'::user_role AND EXISTS (
        SELECT 1 FROM teams t
        WHERE t.id = team_members.team_id
        AND t.lead_id = p.id
      ))
    )
  )
); 