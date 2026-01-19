-- Fix user account issues
-- Run this in Supabase SQL Editor if you need to:
-- 1. Delete a user and recreate them
-- 2. Reset a user's password
-- 3. Confirm an email

-- ============================================
-- OPTION 1: Delete a user completely (use with caution!)
-- ============================================
-- Replace 'user-email@example.com' with the email you want to delete
/*
DELETE FROM auth.users WHERE email = 'user-email@example.com';
-- This will cascade delete from public.users due to ON DELETE CASCADE
*/

-- ============================================
-- OPTION 2: Manually confirm an email (if email confirmation is enabled)
-- ============================================
-- Replace 'user-email@example.com' with the email
/*
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'user-email@example.com' AND email_confirmed_at IS NULL;
*/

-- ============================================
-- OPTION 3: Create a user record if auth user exists but public.users doesn't
-- ============================================
-- Replace 'user-email@example.com' with the email
/*
INSERT INTO public.users (id, email, display_name, theme_preference, current_streak, longest_streak, total_xp, current_level)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'display_name', 'User') as display_name,
  'light',
  0,
  0,
  0,
  1
FROM auth.users
WHERE email = 'user-email@example.com'
  AND id NOT IN (SELECT id FROM public.users);
*/

-- ============================================
-- OPTION 4: Check if email confirmation is required
-- ============================================
-- Go to: Supabase Dashboard → Authentication → Settings
-- Look for "Enable email confirmations" - if it's ON, you need to confirm emails
-- Or disable it for development


