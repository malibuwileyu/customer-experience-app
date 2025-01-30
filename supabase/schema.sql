-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS kb_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES kb_categories(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kb_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES kb_categories(id),
    author_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B')
    ) STORED
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_kb_articles_category_id ON kb_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_author_id ON kb_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_kb_categories_parent_id ON kb_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_kb_categories_display_order ON kb_categories(display_order);
CREATE INDEX idx_kb_articles_metadata ON kb_articles USING gin (metadata);
CREATE INDEX idx_kb_articles_search ON kb_articles USING gin(search_vector);

-- Enable Row Level Security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Tickets policies
CREATE POLICY "Allow users to read their tickets"
ON tickets FOR SELECT
TO authenticated
USING (
    auth.uid() = created_by 
    OR auth.uid() = assigned_to
);

CREATE POLICY "Allow users to create tickets"
ON tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to update their tickets"
ON tickets FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Knowledge Base Articles policies
CREATE POLICY "Users can view published articles"
ON kb_articles FOR SELECT
TO authenticated
USING (
  status = 'published' OR
  author_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'team_lead', 'agent')
  )
);

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_kb_articles_updated_at
    BEFORE UPDATE ON kb_articles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_kb_categories_updated_at
    BEFORE UPDATE ON kb_categories
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trigger_update_kb_article_metadata
  BEFORE INSERT OR UPDATE ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_kb_article_metadata();

-- Create search function
CREATE OR REPLACE FUNCTION search_kb_articles(
  search_query TEXT,
  category_filter UUID DEFAULT NULL,
  metadata_filter JSONB DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category_id UUID,
  author_id UUID,
  status TEXT,
  metadata JSONB,
  search_rank FLOAT4
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.content,
    a.category_id,
    a.author_id,
    a.status,
    a.metadata,
    ts_rank(a.search_vector, websearch_to_tsquery('english', search_query)) as search_rank
  FROM kb_articles a
  WHERE
    (search_query IS NULL OR a.search_vector @@ websearch_to_tsquery('english', search_query))
    AND (category_filter IS NULL OR a.category_id = category_filter)
    AND (metadata_filter IS NULL OR a.metadata @> metadata_filter)
    AND a.status = 'published'
  ORDER BY search_rank DESC, a.updated_at DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_kb_articles(TEXT, UUID, JSONB) TO authenticated;

-- Metadata Update Functions and Triggers
CREATE OR REPLACE FUNCTION update_kb_article_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- If metadata is null, initialize it
  IF NEW.metadata IS NULL THEN
    NEW.metadata := '{}'::JSONB;
  END IF;

  -- Update metadata timestamps
  NEW.metadata := NEW.metadata || jsonb_build_object(
    'last_modified_at', CURRENT_TIMESTAMP,
    'last_modified_by', (SELECT auth.uid())
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_id uuid)
RETURNS setof kb_articles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE kb_articles
  SET view_count = COALESCE(view_count, 0) + 1,
      metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{last_viewed_at}',
        to_jsonb(now())
      )
  WHERE id = article_id
  RETURNING *;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_article_views(uuid) TO authenticated;

-- Add RLS policy for view count updates
CREATE POLICY "Users can increment view counts"
  ON kb_articles
  FOR UPDATE
  USING (true)  -- Allow all authenticated users to increment view counts
  WITH CHECK (true);  -- No additional checks needed since function is security definer 