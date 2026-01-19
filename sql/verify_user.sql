-- Verify user account status
-- Run this to check if email confirmation is the issue

SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at,
  au.last_sign_in_at,
  pu.display_name,
  pu.current_streak
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'entreprekernels@gmail.com';  -- Note: correct spelling

-- If email_confirmed_at is NULL, you need to either:
-- 1. Confirm the email (check your inbox)
-- 2. Or disable email confirmation in Supabase Dashboard:
--    Authentication → Settings → Disable "Enable email confirmations"

-- To manually confirm the email (for development):
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'entreprekernels@gmail.com' 
  AND email_confirmed_at IS NULL;


