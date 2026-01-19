-- Alternative: Recreate the trigger with proper permissions
-- Since we can't directly enable triggers on auth.users, we'll recreate it
-- This should work even if the previous one shows as "disabled"

-- Drop and recreate the trigger (this will work if you have function creation permissions)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with SECURITY DEFINER (this gives it the needed permissions)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, theme_preference, current_streak, longest_streak, total_xp, current_level)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL),
    'light',
    0,
    0,
    0,
    1
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Note: The trigger might still show as "disabled" in pg_trigger,
-- but it should actually work because the function has SECURITY DEFINER.
-- Test by creating a new user and checking if the record appears in public.users


