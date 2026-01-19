-- Enable the user creation trigger
-- Run this to activate the trigger that automatically creates user records

-- Enable the trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Verify it's enabled
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE 
    WHEN tgenabled = 'O' THEN 'Enabled'
    WHEN tgenabled = 'D' THEN 'Disabled'
    ELSE tgenabled::text
  END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- The trigger should now show as "Enabled"
-- New users will automatically get records in public.users when they sign up


