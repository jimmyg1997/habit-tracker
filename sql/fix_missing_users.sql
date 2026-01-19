-- Fix missing user records in public.users
-- Run this if users can sign in but their public.users record doesn't exist

-- Check which auth users don't have public.users records
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'display_name' as display_name_from_meta
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Create missing user records for all auth users
INSERT INTO public.users (id, email, display_name, theme_preference, current_streak, longest_streak, total_xp, current_level)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', NULL) as display_name,
  'light',
  0,
  0,
  0,
  1
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify the fix
SELECT 
  'Total auth users' as description,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Total public users' as description,
  COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
  'Users missing from public.users' as description,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;


