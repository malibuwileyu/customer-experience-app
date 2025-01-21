/**
 * @fileoverview Knowledge Base model type definitions
 * @module types/models/kb
 * @description
 * Type definitions for the knowledge base system.
 * Includes articles, categories, and feedback types.
 */

import { Profile } from '../auth.types';

/**
 * Article status values
 * 
 * @type {ArticleStatus}
 */
export type ArticleStatus = 'draft' | 'review' | 'published' | 'archived';

/**
 * Article visibility levels
 * 
 * @type {ArticleVisibility}
 */
export type ArticleVisibility = 'public' | 'internal' | 'private';

/**
 * Knowledge base category
 * 
 * @interface Category
 * @property {string} id - Unique identifier
 * @property {string} name - Category name
 * @property {string} description - Category description
 * @property {string | null} parent_id - Parent category ID
 * @property {number} order - Display order
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */
export interface Category {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Knowledge base article
 * 
 * @interface Article
 * @property {string} id - Unique identifier
 * @property {string} title - Article title
 * @property {string} content - Article content in Markdown
 * @property {string} category_id - Associated category ID
 * @property {ArticleStatus} status - Current article status
 * @property {ArticleVisibility} visibility - Article visibility level
 * @property {string[]} tags - Article tags
 * @property {string} created_by - User ID who created the article
 * @property {string | null} last_updated_by - User ID who last updated the article
 * @property {Profile} author - User who created the article
 * @property {Profile | null} editor - User who last updated the article
 * @property {number} view_count - Number of views
 * @property {number} helpful_count - Number of helpful votes
 * @property {number} not_helpful_count - Number of not helpful votes
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {string | null} published_at - Publication timestamp
 * @property {Record<string, unknown>} metadata - Additional article metadata
 */
export interface Article {
  id: string;
  title: string;
  content: string;
  category_id: string;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  tags: string[];
  created_by: string;
  last_updated_by: string | null;
  author: Profile;
  editor: Profile | null;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  metadata: Record<string, unknown>;
}

/**
 * Article feedback
 * 
 * @interface ArticleFeedback
 * @property {string} id - Unique identifier
 * @property {string} article_id - Associated article ID
 * @property {boolean} helpful - Whether the article was helpful
 * @property {string | null} comment - Optional feedback comment
 * @property {string | null} created_by - User ID who provided feedback
 * @property {Profile | null} user - User who provided feedback
 * @property {string} created_at - Creation timestamp
 */
export interface ArticleFeedback {
  id: string;
  article_id: string;
  helpful: boolean;
  comment: string | null;
  created_by: string | null;
  user: Profile | null;
  created_at: string;
}

/**
 * Article revision history
 * 
 * @interface ArticleRevision
 * @property {string} id - Unique identifier
 * @property {string} article_id - Associated article ID
 * @property {string} content - Article content at this revision
 * @property {string} created_by - User ID who made the revision
 * @property {Profile} author - User who made the revision
 * @property {string} created_at - Creation timestamp
 * @property {string | null} comment - Revision comment
 */
export interface ArticleRevision {
  id: string;
  article_id: string;
  content: string;
  created_by: string;
  author: Profile;
  created_at: string;
  comment: string | null;
} 