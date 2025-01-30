-- Add display_order column to kb_categories
ALTER TABLE kb_categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create an index on display_order for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_kb_categories_display_order ON kb_categories(display_order);

-- Update existing categories to have sequential order
WITH ordered_categories AS (
  SELECT id, 
         ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM kb_categories
)
UPDATE kb_categories
SET display_order = ordered_categories.rn
FROM ordered_categories
WHERE kb_categories.id = ordered_categories.id;

-- Create a function to update category order
CREATE OR REPLACE FUNCTION update_category_order(
  p_category_id UUID,
  p_old_order INTEGER,
  p_new_order INTEGER
) RETURNS void AS $$
BEGIN
  -- Moving up in the list (smaller number)
  IF p_new_order < p_old_order THEN
    UPDATE kb_categories
    SET display_order = display_order + 1
    WHERE display_order >= p_new_order
    AND display_order < p_old_order
    AND id != p_category_id;
  
  -- Moving down in the list (larger number)
  ELSIF p_new_order > p_old_order THEN
    UPDATE kb_categories
    SET display_order = display_order - 1
    WHERE display_order <= p_new_order
    AND display_order > p_old_order
    AND id != p_category_id;
  END IF;

  -- Update the target category's order
  UPDATE kb_categories
  SET display_order = p_new_order
  WHERE id = p_category_id;
END;
$$ LANGUAGE plpgsql; 