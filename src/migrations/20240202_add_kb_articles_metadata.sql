-- Drop existing policies for kb_articles
DROP POLICY IF EXISTS "Users can view published articles" ON kb_articles;
DROP POLICY IF EXISTS "Authors and admins can update articles" ON kb_articles;
DROP POLICY IF EXISTS "Authors and admins can create articles" ON kb_articles;

-- Drop existing policies for kb_article_versions
DROP POLICY IF EXISTS "Users can view article versions" ON kb_article_versions;
DROP POLICY IF EXISTS "Authors and admins can create article versions" ON kb_article_versions;

-- Drop version-related indexes if they exist
DROP INDEX IF EXISTS idx_kb_articles_version;

-- Drop the existing function with the exact signature
DROP FUNCTION IF EXISTS search_kb_articles(TEXT, UUID, JSONB);

-- Add metadata column to kb_articles
ALTER TABLE kb_articles
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;

-- Create GIN index for efficient JSONB querying on kb_articles
CREATE INDEX IF NOT EXISTS idx_kb_articles_metadata ON kb_articles USING gin (metadata);

-- Add metadata column to kb_article_versions
ALTER TABLE kb_article_versions
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;

-- Create GIN index for efficient JSONB querying on kb_article_versions
CREATE INDEX IF NOT EXISTS idx_kb_article_versions_metadata ON kb_article_versions USING gin (metadata);

-- Ensure search vector exists
ALTER TABLE kb_articles ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED;

-- Create GIN index for full-text search if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_kb_articles_search_vector ON kb_articles USING gin(search_vector);

-- Create function to update kb_article metadata
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

-- Create function to search articles with metadata
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
  status article_status,
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
    AND (
      a.status = 'published'
      OR a.author_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND role IN ('admin', 'agent', 'team_lead')
      )
    )
  ORDER BY search_rank DESC, a.updated_at DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_versions ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to include metadata access
DROP POLICY IF EXISTS "Users can view published articles" ON kb_articles;
CREATE POLICY "Users can view published articles"
ON kb_articles FOR SELECT
TO authenticated
USING (
  status = 'published' OR
  author_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND role IN ('admin', 'agent', 'team_lead')
  )
);

DROP POLICY IF EXISTS "Authors and admins can update articles" ON kb_articles;
CREATE POLICY "Authors and admins can update articles"
ON kb_articles FOR UPDATE
TO authenticated
USING (
  author_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND role IN ('admin', 'team_lead')
  )
)
WITH CHECK (
  author_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND role IN ('admin', 'team_lead')
  )
);

-- Add INSERT policy for kb_articles
DROP POLICY IF EXISTS "Authors and admins can create articles" ON kb_articles;
CREATE POLICY "Authors and admins can create articles"
ON kb_articles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND role IN ('admin', 'team_lead')
  )
);

-- RLS Policies for kb_article_versions
DROP POLICY IF EXISTS "Users can view article versions" ON kb_article_versions; -- Drop existing policy
CREATE POLICY "Users can view article versions"
ON kb_article_versions FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authors and admins can create article versions" ON kb_article_versions; -- Drop existing policy
CREATE POLICY "Authors and admins can create article versions"
ON kb_article_versions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM kb_articles
    WHERE kb_articles.id = article_id
    AND (
      kb_articles.author_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND role IN ('admin', 'team_lead')
      )
    )
  )
);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_kb_articles(TEXT, UUID, JSONB) TO authenticated;
