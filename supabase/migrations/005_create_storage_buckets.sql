-- Create storage buckets for course media
-- Run this in your Supabase SQL editor

-- Create course-media bucket for images and documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-media',
  'course-media',
  true,
  104857600, -- 100MB
  ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create course-videos bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  true,
  524288000, -- 500MB
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for course-media bucket
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload course media" ON storage.objects;
DROP POLICY IF EXISTS "Public can read course media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete course media" ON storage.objects;

-- Allow authenticated admins to upload
CREATE POLICY "Admins can upload course media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-media' AND
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Allow public read access
CREATE POLICY "Public can read course media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-media');

-- Allow admins to delete
CREATE POLICY "Admins can delete course media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-media' AND
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Set up RLS policies for course-videos bucket
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload course videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read course videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete course videos" ON storage.objects;

CREATE POLICY "Admins can upload course videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-videos' AND
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Public can read course videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-videos');

CREATE POLICY "Admins can delete course videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-videos' AND
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

