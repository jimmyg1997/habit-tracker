-- Check users in the database
-- Run this in Supabase SQL Editor to see all users

-- Check auth.users (Supabase authentication table)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Check public.users (our custom table)
SELECT 
  id,
  email,
  display_name,
  current_streak,
  total_xp,
  current_level,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- Check if a specific user exists in both tables
-- Replace 'your-email@example.com' with the email you're trying to use
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  au.email_confirmed_at,
  pu.id as public_user_id,
  pu.display_name,
  pu.current_streak
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'entreprerkernels@gmail.com';


