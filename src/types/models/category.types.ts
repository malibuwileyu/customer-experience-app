/**
 * @fileoverview Category type definitions
 * @module types/models/category
 */

import { Database } from '../database.types'

export interface Category {
  id: string
  name: string
  description?: string
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface CreateCategoryDTO {
  name: string
  description?: string
  parent_id?: string
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

// Database types
export type CategoryRow = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'] 