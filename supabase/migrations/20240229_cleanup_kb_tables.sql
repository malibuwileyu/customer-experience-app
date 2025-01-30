-- Delete all kb_article_versions
DELETE FROM kb_article_versions;

-- Delete all kb_articles except the specified one
DELETE FROM kb_articles 
WHERE id != 'aead35aa-24a5-4640-90a2-bdcc4cae7430';

-- Delete all kb_categories except the specified one
DELETE FROM kb_categories 
WHERE id != '258ab2fa-c668-484d-a2e1-816a861f1336'; 