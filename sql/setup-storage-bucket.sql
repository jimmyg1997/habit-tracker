-- Setup script for journal-media storage bucket
-- Run this in Supabase SQL Editor, then go to Storage settings to create the bucket

-- Note: Storage buckets must be created through the Supabase Dashboard UI
-- Go to: Storage → Create Bucket
-- Name: journal-media
-- Public: Yes
-- File size limit: 50MB
-- Allowed MIME types: image/*, video/*

-- After creating the bucket, you can set up RLS policies:

-- Allow authenticated users to upload to their own date folders
CREATE POLICY "Users can upload to own journal media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view their own media
CREATE POLICY "Users can view own journal media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'journal-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own media
CREATE POLICY "Users can delete own journal media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'journal-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);


