-- Drop existing permissive policy
DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON kb_categories;

-- Create new policies that respect role hierarchy
CREATE POLICY "Categories are viewable by all authenticated users"
ON kb_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Categories can only be managed by admins"
ON kb_categories FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Categories can only be updated by admins"
ON kb_categories FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Categories can only be deleted by admins"
ON kb_categories FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
); 