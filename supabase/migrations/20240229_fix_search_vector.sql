-- Drop existing search vector if it exists
ALTER TABLE kb_articles DROP COLUMN IF EXISTS search_vector;

-- Add search vector column with proper configuration
ALTER TABLE kb_articles ADD COLUMN search_vector tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'B')
) STORED;

-- Create GIN index for search_vector if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_kb_articles_search_vector 
ON kb_articles USING gin(search_vector);

-- Refresh search vectors for existing articles
UPDATE kb_articles 
SET updated_at = NOW()
WHERE true; 