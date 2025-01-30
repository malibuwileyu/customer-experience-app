import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Knowledge Base Migration Tests', () => {
  let migrationSql: string

  beforeAll(() => {
    // Read migration file
    migrationSql = fs.readFileSync(
      path.join(__dirname, '../20240201_create_knowledge_base_tables.sql'),
      'utf8'
    )
  })

  describe('SQL Syntax Tests', () => {
    it('should contain all required table creation statements', () => {
      expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS kb_categories')
      expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS kb_articles')
      expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS kb_article_versions')
    })

    it('should have proper foreign key references', () => {
      expect(migrationSql).toContain('REFERENCES kb_categories(id)')
      expect(migrationSql).toContain('REFERENCES auth.users(id)')
      expect(migrationSql).toContain('REFERENCES kb_articles(id)')
    })

    it('should create all required indexes', () => {
      expect(migrationSql).toContain('CREATE INDEX idx_kb_categories_parent_id')
      expect(migrationSql).toContain('CREATE INDEX idx_kb_categories_name')
      expect(migrationSql).toContain('CREATE INDEX idx_kb_articles_category_id')
      expect(migrationSql).toContain('CREATE INDEX idx_kb_articles_author_id')
      expect(migrationSql).toContain('CREATE INDEX idx_kb_articles_status')
      expect(migrationSql).toContain('CREATE INDEX idx_kb_articles_published_at')
      expect(migrationSql).toContain('CREATE INDEX idx_kb_articles_updated_at')
      expect(migrationSql).toContain('CREATE INDEX idx_kb_articles_search_vector')
      expect(migrationSql).toContain('CREATE INDEX idx_kb_article_versions_article_id_version')
    })

    it('should enable RLS on all tables', () => {
      expect(migrationSql).toContain('ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY')
      expect(migrationSql).toContain('ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY')
      expect(migrationSql).toContain('ALTER TABLE kb_article_versions ENABLE ROW LEVEL SECURITY')
    })

    it('should create RLS policies for kb_categories', () => {
      expect(migrationSql).toContain('CREATE POLICY "Categories are viewable by authenticated users"')
      expect(migrationSql).toContain('CREATE POLICY "Categories can be managed by admins and team leads"')
    })

    it('should create RLS policies for kb_articles', () => {
      expect(migrationSql).toContain('CREATE POLICY "Published articles are viewable by authenticated users"')
      expect(migrationSql).toContain('CREATE POLICY "Articles can be managed by authors and authorized roles"')
    })

    it('should create RLS policies for kb_article_versions', () => {
      expect(migrationSql).toContain('CREATE POLICY "Article versions are viewable by article authors and authorized roles"')
      expect(migrationSql).toContain('CREATE POLICY "Article versions can be created by article authors and authorized roles"')
    })

    it('should create triggers for updated_at timestamps', () => {
      expect(migrationSql).toContain('CREATE TRIGGER update_kb_categories_updated_at')
      expect(migrationSql).toContain('CREATE TRIGGER update_kb_articles_updated_at')
    })
  })

  describe('Full-Text Search Tests', () => {
    it('should set up tsvector column with proper weights', () => {
      const searchVectorDef = migrationSql.match(/search_vector tsvector GENERATED ALWAYS AS \((.*?)\) STORED/s)?.[1]
      
      expect(searchVectorDef).toBeDefined()
      expect(searchVectorDef).toContain("setweight(to_tsvector('english', coalesce(title, '')), 'A')")
      expect(searchVectorDef).toContain("setweight(to_tsvector('english', coalesce(content, '')), 'B')")
    })

    it('should create GIN index for search_vector', () => {
      expect(migrationSql).toContain('CREATE INDEX idx_kb_articles_search_vector ON kb_articles USING gin(search_vector)')
    })
  })

  describe('Schema Consistency Tests', () => {
    it('should use consistent timestamp type (TIMESTAMPTZ)', () => {
      const timestampMatches = migrationSql.match(/TIMESTAMPTZ/g) || []
      expect(timestampMatches.length).toBeGreaterThan(0)
      
      // Should not use TIMESTAMP without TZ
      expect(migrationSql).not.toMatch(/TIMESTAMP\s+(?!TZ)/)
    })

    it('should use consistent ID type (UUID)', () => {
      const idMatches = migrationSql.match(/id UUID/g) || []
      expect(idMatches.length).toBeGreaterThan(0)
      
      // Should not use other ID types
      expect(migrationSql).not.toMatch(/id\s+(?:INTEGER|BIGINT|SERIAL)/)
    })
  })
}); 