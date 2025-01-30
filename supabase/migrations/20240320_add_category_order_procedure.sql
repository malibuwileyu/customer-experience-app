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