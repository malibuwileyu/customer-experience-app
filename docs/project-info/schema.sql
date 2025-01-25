-- Drop the vector extension if it exists
DROP EXTENSION IF EXISTS vector CASCADE;

-- Cleanup existing schema
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop pgtap extension if it exists
    DROP EXTENSION IF EXISTS pgtap CASCADE;

    -- Drop all functions in public schema
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args FROM pg_proc WHERE pronamespace = 'public'::regnamespace) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
    END LOOP;

    -- Drop all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Drop all custom types
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;

    -- Drop all policies
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'agent', 'team_lead', 'admin', 'super_admin');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  preferences JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ
);

-- Create role_audit_log table
CREATE TABLE IF NOT EXISTS role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  old_role user_role,
  new_role user_role NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for role_audit_log
CREATE INDEX idx_role_audit_log_user_id ON role_audit_log(user_id);
CREATE INDEX idx_role_audit_log_created_at ON role_audit_log(created_at DESC);

-- Enable RLS for role_audit_log
ALTER TABLE role_audit_log ENABLE ROW LEVEL SECURITY;

-- Role audit log policies
CREATE POLICY "Enable read access for authenticated users"
ON role_audit_log FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON role_audit_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = changed_by);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'agent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  category_id UUID REFERENCES categories(id),
  team_id UUID REFERENCES teams(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::JSONB,
  custom_fields JSONB DEFAULT '{}'::JSONB,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  internal_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
  attachments JSONB[] DEFAULT ARRAY[]::JSONB[],
  sla_due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  parent_id UUID REFERENCES ticket_comments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ticket_status_history table
CREATE TABLE IF NOT EXISTS ticket_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  old_status ticket_status,
  new_status ticket_status NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for ticket_status_history
CREATE INDEX idx_ticket_status_history_ticket_id ON ticket_status_history(ticket_id);
CREATE INDEX idx_ticket_status_history_changed_by ON ticket_status_history(changed_by);

-- Enable RLS for ticket_status_history
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;

-- Create policy for ticket_status_history
CREATE POLICY "Status history viewable by team members and ticket creators"
ON ticket_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = ticket_status_history.ticket_id
    AND (
      t.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.team_id = t.team_id
      )
    )
  )
);

-- Function to update ticket status
CREATE OR REPLACE FUNCTION update_ticket_status(
  p_ticket_id UUID,
  p_new_status ticket_status,
  p_changed_by UUID
) RETURNS SETOF tickets AS $$
DECLARE
  v_old_status ticket_status;
  v_ticket tickets%ROWTYPE;
BEGIN
  -- Check if the ticket exists
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN
    RAISE EXCEPTION 'Ticket does not exist';
  END IF;

  -- Get current status
  SELECT status INTO v_old_status
  FROM tickets
  WHERE id = p_ticket_id;

  -- Update ticket
  UPDATE tickets
  SET 
    status = p_new_status,
    updated_at = NOW()
  WHERE id = p_ticket_id
  RETURNING * INTO v_ticket;

  -- Record status history
  INSERT INTO ticket_status_history (
    ticket_id,
    changed_by,
    old_status,
    new_status
  ) VALUES (
    p_ticket_id,
    p_changed_by,
    v_old_status,
    p_new_status
  );

  RETURN NEXT v_ticket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON ticket_status_history TO authenticated;
GRANT EXECUTE ON FUNCTION update_ticket_status(UUID, ticket_status, UUID) TO authenticated;

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status article_status NOT NULL DEFAULT 'draft',
  category_id UUID REFERENCES categories(id),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED
);

-- Create article_versions table
CREATE TABLE IF NOT EXISTS article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  version INT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id, version)
);

-- Create embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(content_type, content_id)
);

-- Create indexes
CREATE INDEX idx_teams_lead_id ON teams(lead_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_team_id ON tickets(team_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_category_id ON tickets(category_id);
CREATE INDEX idx_tickets_updated_at ON tickets(updated_at DESC);
CREATE INDEX idx_tickets_sla_due_at ON tickets(sla_due_at);
CREATE INDEX idx_tickets_tags ON tickets USING gin(tags);
CREATE INDEX idx_tickets_metadata ON tickets USING gin(metadata);
CREATE INDEX idx_tickets_custom_fields ON tickets USING gin(custom_fields);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_user_id ON ticket_comments(user_id);
CREATE INDEX idx_ticket_comments_parent_id ON ticket_comments(parent_id);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_search_vector ON articles USING gin(search_vector);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_updated_at ON articles(updated_at DESC);
CREATE INDEX idx_article_versions_article_id_version ON article_versions(article_id, version DESC);
CREATE INDEX idx_embeddings_content_type_id ON embeddings(content_type, content_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Ticket Comments Policies
CREATE POLICY "Users can view comments on accessible tickets"
ON ticket_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tickets t
    LEFT JOIN team_members tm ON t.team_id = tm.team_id
    WHERE t.id = ticket_comments.ticket_id
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
);

CREATE POLICY "Users can create comments on accessible tickets"
ON ticket_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tickets t
    LEFT JOIN team_members tm ON t.team_id = tm.team_id
    WHERE t.id = ticket_id
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
);

CREATE POLICY "Users can update their own comments"
ON ticket_comments FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
ON ticket_comments FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all comments"
ON ticket_comments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Storage Policies for Ticket Attachments
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

-- Create storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Function to update ticket attachments
CREATE OR REPLACE FUNCTION update_ticket_attachments(
  p_ticket_id UUID,
  p_attachments TEXT[]
)
RETURNS SETOF tickets
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_attachment_objects JSONB[];
  v_ticket tickets%ROWTYPE;
BEGIN
  -- Check if the ticket exists
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN
    RAISE EXCEPTION 'Ticket does not exist';
  END IF;

  -- Check if user has permission to update the ticket
  IF NOT EXISTS (
    SELECT 1 FROM tickets t
    LEFT JOIN team_members tm ON t.team_id = tm.team_id
    WHERE t.id = p_ticket_id
    AND (
      t.created_by = auth.uid() OR
      t.assigned_to = auth.uid() OR
      tm.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    )
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Convert text array of paths to array of JSONB objects
  SELECT array_agg(
    jsonb_build_object(
      'path', attachment,
      'name', split_part(attachment, '/', -1),
      'type', CASE 
        WHEN attachment LIKE '%.pdf' THEN 'application/pdf'
        WHEN attachment LIKE '%.png' THEN 'image/png'
        WHEN attachment LIKE '%.jpg' THEN 'image/jpeg'
        WHEN attachment LIKE '%.jpeg' THEN 'image/jpeg'
        ELSE 'application/octet-stream'
      END,
      'created_at', NOW()
    )
  )
  INTO v_attachment_objects
  FROM unnest(p_attachments) AS attachment;

  -- Update ticket
  UPDATE tickets
  SET 
    attachments = COALESCE(v_attachment_objects, ARRAY[]::JSONB[]),
    updated_at = NOW()
  WHERE id = p_ticket_id
  RETURNING * INTO v_ticket;

  RETURN NEXT v_ticket;
END;
$$;

-- Create RLS policies for tickets table
CREATE POLICY "Users can view their own tickets"
ON tickets FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Agents can view assigned tickets"
ON tickets FOR SELECT
USING (
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('agent', 'admin')
  )
);

CREATE POLICY "Team members can view team tickets"
ON tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = tickets.team_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create tickets"
ON tickets FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  (
    -- Regular users can only create tickets without team assignment
    (
      NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('agent', 'admin')
      ) AND team_id IS NULL
    ) OR
    -- Agents and admins can create tickets with team assignment
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('agent', 'admin')
    )
  )
);

CREATE POLICY "Agents can update assigned tickets"
ON tickets FOR UPDATE
USING (
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = tickets.team_id
    AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = tickets.team_id
    AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete tickets"
ON tickets FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);