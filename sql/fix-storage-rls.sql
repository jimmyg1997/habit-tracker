-- Fix RLS Policies for journal-media Storage Bucket
-- Run this in Supabase SQL Editor to allow authenticated users to upload media

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload own journal media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own journal media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own journal media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own journal media" ON storage.objects;

-- Option 1: Simple policy - allow all authenticated users to upload/view/delete in journal-media bucket
-- This is simpler and works if the bucket is public
CREATE POLICY "Users can upload own journal media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'journal-media');

CREATE POLICY "Users can view own journal media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'journal-media');

CREATE POLICY "Users can delete own journal media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'journal-media');

-- Option 2: More secure - only allow users to access their own folders
-- Uncomment this if you want stricter security (and comment out Option 1 above)
/*
CREATE POLICY "Users can upload own journal media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal-media' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own journal media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'journal-media' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own journal media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'journal-media' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);
*/

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%journal%';

