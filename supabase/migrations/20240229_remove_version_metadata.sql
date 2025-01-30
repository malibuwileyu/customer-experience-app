-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_update_kb_article_metadata ON kb_articles;
DROP TRIGGER IF EXISTS trigger_validate_kb_article_metadata ON kb_articles;

-- Update the metadata function to remove version handling
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

-- Create function to validate kb_article metadata structure
CREATE OR REPLACE FUNCTION validate_kb_article_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure required metadata fields exist
  IF NOT (NEW.metadata ? 'last_modified_at' AND NEW.metadata ? 'last_modified_by') THEN
    RAISE EXCEPTION 'Invalid metadata structure: missing required fields';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers with updated functions
CREATE TRIGGER trigger_update_kb_article_metadata
  BEFORE INSERT OR UPDATE ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_kb_article_metadata();

CREATE TRIGGER trigger_validate_kb_article_metadata
  BEFORE INSERT OR UPDATE ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION validate_kb_article_metadata(); 