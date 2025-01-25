-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_team_lead_role_trigger ON teams;
DROP FUNCTION IF EXISTS update_team_lead_role();

-- Create function to update team lead role
CREATE OR REPLACE FUNCTION update_team_lead_role()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to update team lead role
CREATE TRIGGER update_team_lead_role_trigger
BEFORE INSERT OR UPDATE OF lead_id ON teams
FOR EACH ROW
EXECUTE FUNCTION update_team_lead_role();

-- Add constraint to prevent customers from being team members
ALTER TABLE team_members
ADD CONSTRAINT prevent_customer_team_members
CHECK (
  NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role = 'customer'
  )
); 