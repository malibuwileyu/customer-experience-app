-- Drop existing role constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add updated role constraint with static values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('customer', 'agent', 'team_lead', 'admin', 'super_admin'));

-- Update handle_new_user function to handle all roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role text;
BEGIN
  -- Determine role from metadata, default to customer
  assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');

  -- Validate role
  IF assigned_role NOT IN ('customer', 'agent', 'team_lead', 'admin', 'super_admin') THEN
    assigned_role := 'customer';
  END IF;

  -- Create profile with minimal required data
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    assigned_role
  );

  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;