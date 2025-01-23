-- This snippet drops the existing 'ticket-attachments' bucket and creates a new one with the same name.

-- Drop existing bucket and objects if they exist
DO $$
BEGIN
    -- First delete all objects in the bucket
    DELETE FROM storage.objects
    WHERE bucket_id = 'ticket-attachments';

    -- Then delete the bucket itself
    DELETE FROM storage.buckets 
    WHERE id = 'ticket-attachments';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create a new private bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ticket-attachments',
  'ticket-attachments',
  false,
  52428800, -- 50MB in bytes
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip'
  ]::text[]
);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload ticket attachments') THEN
        DROP POLICY "Users can upload ticket attachments" ON storage.objects;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view ticket attachments') THEN
        DROP POLICY "Users can view ticket attachments" ON storage.objects;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete ticket attachments') THEN
        DROP POLICY "Users can delete ticket attachments" ON storage.objects;
    END IF;
END $$;

-- Create policies for ticket attachments
-- Allow users to upload files to tickets they have access to
CREATE POLICY "Users can upload ticket attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-attachments' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id::text = (storage.foldername(name))[1]
    AND (
      t.created_by = auth.uid() OR -- ticket creator
      t.assigned_to = auth.uid() OR -- assigned agent
      EXISTS ( -- team member
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = t.team_id
        AND tm.user_id = auth.uid()
      )
    )
  )
);

-- Allow users to read files from tickets they have access to
CREATE POLICY "Users can view ticket attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ticket-attachments' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id::text = (storage.foldername(name))[1]
    AND (
      t.created_by = auth.uid() OR -- ticket creator
      t.assigned_to = auth.uid() OR -- assigned agent
      EXISTS ( -- team member
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = t.team_id
        AND tm.user_id = auth.uid()
      )
    )
  )
);

-- Allow users to delete files from tickets they have access to
CREATE POLICY "Users can delete ticket attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ticket-attachments' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id::text = (storage.foldername(name))[1]
    AND (
      t.created_by = auth.uid() OR -- ticket creator
      t.assigned_to = auth.uid() OR -- assigned agent
      EXISTS ( -- team member
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = t.team_id
        AND tm.user_id = auth.uid()
      )
    )
  )
);