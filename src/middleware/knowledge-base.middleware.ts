/**
 * @fileoverview Knowledge Base Middleware
 * @description
 * Middleware for protecting knowledge base routes and enforcing permissions
 */

import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'
import { roleManagementService } from '../services/role-management.service'

/**
 * Middleware to check if user has permission to manage categories
 */
export async function canManageCategories(_: Request, res: Response, next: NextFunction) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const hasPermission = await roleManagementService.checkPermission({
      userId: user.data.user.id,
      permission: 'manage_kb_categories'
    })
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  } catch (error) {
    console.error('Error checking category management permission:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Middleware to check if user has permission to manage articles
 */
export async function canManageArticles(_: Request, res: Response, next: NextFunction) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const hasPermission = await roleManagementService.checkPermission({
      userId: user.data.user.id,
      permission: 'manage_kb_articles'
    })
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  } catch (error) {
    console.error('Error checking article management permission:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Middleware to check if user has permission to view knowledge base
 */
export async function canViewKnowledgeBase(_: Request, res: Response, next: NextFunction) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const hasPermission = await roleManagementService.checkPermission({
      userId: user.data.user.id,
      permission: 'view_kb'
    })
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  } catch (error) {
    console.error('Error checking knowledge base view permission:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Middleware to check if user is the author of an article or an admin
 */
export async function isArticleAuthorOrAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: article, error } = await supabase
      .from('kb_articles')
      .select('author_id')
      .eq('id', req.params.id)
      .single()

    if (error || !article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    const hasAdminPermission = await roleManagementService.checkPermission({
      userId: user.data.user.id,
      permission: 'admin'
    })
    
    if (article.author_id !== user.data.user.id && !hasAdminPermission) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  } catch (error) {
    console.error('Error checking article author permission:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 