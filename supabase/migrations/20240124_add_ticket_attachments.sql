-- Add attachments column to tickets table
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS attachments JSONB[] DEFAULT ARRAY[]::JSONB[];

-- Create storage bucket for ticket attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ticket attachments
CREATE POLICY "Users can upload ticket attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-attachments'
  AND (
    EXISTS (
      SELECT 1 FROM tickets t
      LEFT JOIN team_members tm ON t.team_id = tm.team_id
      WHERE t.id::text = (storage.foldername(name))[1]
      AND (
        t.created_by = auth.uid() OR  -- Ticket creator
        t.assigned_to = auth.uid() OR  -- Assigned agent
        tm.user_id = auth.uid() OR     -- Team member
        EXISTS (                       -- Admin check
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role = 'admin'
        )
      )
    )
  )
);

-- Allow users to view attachments for tickets they have access to
CREATE POLICY "Users can view ticket attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ticket-attachments'
  AND (
    EXISTS (
      SELECT 1 FROM tickets t
      LEFT JOIN team_members tm ON t.team_id = tm.team_id
      WHERE t.id::text = (storage.foldername(name))[1]
      AND (
        t.created_by = auth.uid() OR  -- Ticket creator
        t.assigned_to = auth.uid() OR  -- Assigned agent
        tm.user_id = auth.uid() OR     -- Team member
        EXISTS (                       -- Admin check
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role = 'admin'
        )
      )
    )
  )
);

-- Allow users to delete their own attachments
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ticket-attachments'
  AND (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id::text = (storage.foldername(name))[1]
      AND t.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
); 