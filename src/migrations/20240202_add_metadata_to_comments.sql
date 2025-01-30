-- Add metadata column to ticket_comments
ALTER TABLE ticket_comments
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;

-- Create index for metadata column to improve query performance
CREATE INDEX IF NOT EXISTS idx_ticket_comments_metadata ON ticket_comments USING gin (metadata);

-- Update RLS policy to ensure metadata is properly handled
DROP POLICY IF EXISTS "Users can update their own comments" ON ticket_comments;
CREATE POLICY "Users can update their own comments"
ON ticket_comments FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND role IN ('admin', 'agent', 'team_lead')
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND role IN ('admin', 'agent', 'team_lead')
  )
); 