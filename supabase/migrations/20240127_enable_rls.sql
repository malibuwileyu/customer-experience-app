-- Enable RLS on tables
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;

-- Policy for kb_articles: Allow anyone to read articles
CREATE POLICY "Allow public read access to articles"
ON kb_articles
FOR SELECT
TO public
USING (true);

-- Policy for kb_articles: Allow authenticated users to create/update/delete articles
CREATE POLICY "Allow authenticated users to manage articles"
ON kb_articles
FOR ALL
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Policy for kb_categories: Allow anyone to read categories
CREATE POLICY "Allow public read access to categories"
ON kb_categories
FOR SELECT
TO public
USING (true);

-- Policy for kb_categories: Allow authenticated users to manage categories
CREATE POLICY "Allow authenticated users to manage categories"
ON kb_categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true); 