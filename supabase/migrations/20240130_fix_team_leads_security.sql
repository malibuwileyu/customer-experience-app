-- Drop existing function
DROP FUNCTION IF EXISTS update_team_lead_role() CASCADE;

-- Create function to update team lead role with SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_team_lead_role()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the new team lead is not a customer
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = NEW.lead_id 
    AND role = 'customer'
  ) THEN
    RAISE EXCEPTION 'Customers cannot be team leads';
  END IF;

  -- Check if the user is already a team lead for another team
  IF EXISTS (
    SELECT 1 FROM teams 
    WHERE lead_id = NEW.lead_id 
    AND id != COALESCE(NEW.id, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)
  ) THEN
    RAISE EXCEPTION 'A user cannot lead multiple teams';
  END IF;

  -- Update the user's role to team_lead if they're not an admin
  UPDATE profiles 
  SET role = 'team_lead' 
  WHERE id = NEW.lead_id 
  AND role NOT IN ('admin', 'super_admin');

  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_team_lead_role_trigger
BEFORE INSERT OR UPDATE OF lead_id ON teams
FOR EACH ROW
EXECUTE FUNCTION update_team_lead_role(); 