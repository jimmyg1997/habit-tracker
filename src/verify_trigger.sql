-- Verify the database trigger is installed and working
-- Run this to check if the trigger exists

-- Check if the function exists
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Check if the trigger exists
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- If the trigger doesn't exist, you need to run migration-add-trigger.sql
-- If it exists but isn't working, check the function code above


