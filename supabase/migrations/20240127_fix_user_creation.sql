-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create user_role type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer', 'agent', 'team_lead', 'admin', 'super_admin');
  END IF;
END$$;

-- Drop existing role constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add updated role constraint with static values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('customer', 'agent', 'team_lead', 'admin', 'super_admin'));

-- Create simplified profile trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role user_role;
BEGIN
  -- Determine role from metadata, default to customer
  assigned_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'customer'::user_role
  );

  -- Create profile with minimal required data
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    assigned_role::text
  );

  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing profiles with emails if missing
UPDATE public.profiles p
SET 
  email = u.email,
  full_name = COALESCE(p.full_name, u.email)
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.full_name IS NULL);