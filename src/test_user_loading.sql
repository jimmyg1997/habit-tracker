-- Test script to verify user data is accessible
-- Run this to check if RLS policies are working correctly

-- Test 1: Check if we can query users directly
SELECT 
  id,
  email,
  display_name,
  current_streak,
  total_xp,
  current_level
FROM public.users
WHERE email IN ('entreprekernels@gmail.com', 'dgeorgiou3@gmail.com')
ORDER BY email;

-- Test 2: Check RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Test 3: Verify the current user context
SELECT 
  current_user as database_user,
  session_user as session_user,
  current_setting('request.jwt.claim.sub', true) as auth_user_id;

-- Test 4: Try to select as if you're one of the users
-- (This simulates what the app does)
SET LOCAL request.jwt.claim.sub = 'e8e00bb8-3cfa-47d8-921c-95a40baf9c62';
SELECT * FROM public.users WHERE id = 'e8e00bb8-3cfa-47d8-921c-95a40baf9c62';

-- Note: Test 4 might fail in SQL Editor, but it shows what the app should see
-- The app uses the authenticated user's JWT token, which should work


