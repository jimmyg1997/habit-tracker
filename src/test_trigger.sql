-- Test if the trigger is actually working
-- Even if it shows as "disabled", it might still work

-- Check recent users and their public.users records
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  pu.id as public_user_id,
  pu.created_at as public_created,
  CASE 
    WHEN pu.id IS NOT NULL THEN '✅ Has record'
    ELSE '❌ Missing record'
  END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC
LIMIT 5;

-- If all users have records, the trigger is working!
-- If some are missing, you may need to manually create them using fix_missing_users.sql


