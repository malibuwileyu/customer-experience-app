-- Drop user_roles table as we're consolidating to profiles.role
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Ensure profiles has proper role handling
ALTER TABLE profiles 
ALTER COLUMN role SET NOT NULL,
ALTER COLUMN role SET DEFAULT 'customer'::user_role;

-- Update profiles policies to allow role viewing
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
CREATE POLICY "Users can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);  -- Allow viewing all profiles for team management

-- Grant necessary permissions
GRANT SELECT ON profiles TO authenticated; 