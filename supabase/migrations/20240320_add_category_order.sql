-- Add display_order column to kb_categories
ALTER TABLE kb_categories ADD COLUMN display_order INTEGER DEFAULT 0;

-- Create an index on display_order for faster ordering queries
CREATE INDEX idx_kb_categories_display_order ON kb_categories(display_order);

-- Update existing categories to have sequential order
WITH RECURSIVE ordered_categories AS (
  SELECT id, 
         ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM kb_categories
)
UPDATE kb_categories
SET display_order = ordered_categories.rn
FROM ordered_categories
WHERE kb_categories.id = ordered_categories.id; 