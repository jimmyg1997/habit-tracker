-- Fix RLS policies for health_metrics
-- The 406 error suggests RLS might be blocking the query

-- Check current policies
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
WHERE tablename = 'health_metrics';

-- If policies are missing or incorrect, recreate them:

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own health metrics" ON health_metrics;
DROP POLICY IF EXISTS "Users can insert own health metrics" ON health_metrics;
DROP POLICY IF EXISTS "Users can update own health metrics" ON health_metrics;

-- Recreate policies
CREATE POLICY "Users can view own health metrics" ON health_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health metrics" ON health_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health metrics" ON health_metrics
  FOR UPDATE USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;


