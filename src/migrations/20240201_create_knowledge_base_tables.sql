-- Create knowledge base tables and search functionality

-- Create kb_categories table
CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES kb_categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create kb_articles table
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status article_status NOT NULL DEFAULT 'draft',
  category_id UUID REFERENCES kb_categories(id),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED
);

-- Create kb_article_versions table for version tracking
CREATE TABLE IF NOT EXISTS kb_article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  version INT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id, version)
);

-- Create indexes
CREATE INDEX idx_kb_categories_parent_id ON kb_categories(parent_id);
CREATE INDEX idx_kb_categories_name ON kb_categories(name);
CREATE INDEX idx_kb_articles_category_id ON kb_articles(category_id);
CREATE INDEX idx_kb_articles_author_id ON kb_articles(author_id);
CREATE INDEX idx_kb_articles_status ON kb_articles(status);
CREATE INDEX idx_kb_articles_published_at ON kb_articles(published_at DESC);
CREATE INDEX idx_kb_articles_updated_at ON kb_articles(updated_at DESC);
CREATE INDEX idx_kb_articles_search_vector ON kb_articles USING gin(search_vector);
CREATE INDEX idx_kb_article_versions_article_id_version ON kb_article_versions(article_id, version DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kb_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kb_categories_updated_at
  BEFORE UPDATE ON kb_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_kb_updated_at();

CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_kb_updated_at();

-- Enable RLS
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kb_categories

-- View categories
CREATE POLICY "Categories are viewable by authenticated users"
ON kb_categories FOR SELECT
TO authenticated
USING (true);

-- Manage categories (requires admin or team_lead role)
CREATE POLICY "Categories can be managed by admins and team leads"
ON kb_categories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'team_lead')
  )
);

-- RLS Policies for kb_articles

-- View published articles
CREATE POLICY "Published articles are viewable by authenticated users"
ON kb_articles FOR SELECT
TO authenticated
USING (
  status = 'published'
  OR author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'team_lead', 'agent')
  )
);

-- Manage articles (requires admin, team_lead, agent role or be the author)
CREATE POLICY "Articles can be managed by authors and authorized roles"
ON kb_articles FOR ALL
TO authenticated
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'team_lead', 'agent')
  )
);

-- RLS Policies for kb_article_versions

-- View article versions
CREATE POLICY "Article versions are viewable by article authors and authorized roles"
ON kb_article_versions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kb_articles
    WHERE kb_articles.id = kb_article_versions.article_id
    AND (
      kb_articles.author_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'team_lead', 'agent')
      )
    )
  )
);

-- Insert article versions (requires being the article author or having authorized role)
CREATE POLICY "Article versions can be created by article authors and authorized roles"
ON kb_article_versions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM kb_articles
    WHERE kb_articles.id = article_id
    AND (
      kb_articles.author_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'team_lead', 'agent')
      )
    )
  )
); 