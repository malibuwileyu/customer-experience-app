import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

declare global {
  namespace Express {
    interface Request {
      supabase: SupabaseClient<Database>
      user?: {
        id: string
        [key: string]: any
      }
    }
  }
} 