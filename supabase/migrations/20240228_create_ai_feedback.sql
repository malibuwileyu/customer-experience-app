-- Create AI feedback table
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 4),
  category TEXT NOT NULL CHECK (category IN ('accuracy', 'relevance', 'tone', 'clarity', 'completeness')),
  comment TEXT,
  user_id UUID REFERENCES auth.users(id),
  ticket_id UUID REFERENCES tickets(id),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to submit feedback
CREATE POLICY "Allow authenticated users to submit feedback"
  ON public.ai_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user is submitting their own feedback
    auth.uid() = user_id
    OR
    -- Allow if user has access to the ticket
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.user_id = auth.uid()
          AND tm.team_id = t.team_id
        )
      )
    )
    OR
    -- Allow if user is an admin or agent
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (u.raw_user_meta_data->>'role' IN ('admin', 'agent'))
    )
  );

-- Allow users to view their own feedback and feedback for tickets they have access to
CREATE POLICY "Allow users to view relevant feedback"
  ON public.ai_feedback
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if viewing own feedback
    auth.uid() = user_id
    OR
    -- Allow if user has access to the ticket
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.user_id = auth.uid()
          AND tm.team_id = t.team_id
        )
      )
    )
    OR
    -- Allow if user is an admin or agent
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (u.raw_user_meta_data->>'role' IN ('admin', 'agent'))
    )
  );

-- Create indexes
CREATE INDEX idx_ai_feedback_message_id ON public.ai_feedback(message_id);
CREATE INDEX idx_ai_feedback_user_id ON public.ai_feedback(user_id);
CREATE INDEX idx_ai_feedback_ticket_id ON public.ai_feedback(ticket_id);
CREATE INDEX idx_ai_feedback_category ON public.ai_feedback(category);
CREATE INDEX idx_ai_feedback_rating ON public.ai_feedback(rating);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_feedback_updated_at
  BEFORE UPDATE ON public.ai_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();