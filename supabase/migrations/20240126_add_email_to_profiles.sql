-- Add email column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text REFERENCES auth.users(email);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update existing profiles with emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Make email column NOT NULL after populating data
ALTER TABLE public.profiles
ALTER COLUMN email SET NOT NULL;

-- Create trigger to keep email in sync
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.email <> OLD.email THEN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS sync_profile_email ON auth.users;
CREATE TRIGGER sync_profile_email
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email(); 