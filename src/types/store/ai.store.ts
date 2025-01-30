/**
 * @fileoverview AI feature store type definitions
 * @module types/store/ai
 * @description
 * Type definitions for the AI feature store using Zustand.
 * Includes state and actions for managing AI message generation and feedback.
 */

import type { MessageContext, MessageConfig, GeneratedMessage } from '../../services/message-generation.service'
import { FeedbackRating, FeedbackCategory } from '../../services/feedback.service'

// Re-export for convenience
export { FeedbackRating, FeedbackCategory }

/**
 * Feedback data structure
 */
export interface Feedback {
  messageId: string
  rating: FeedbackRating
  category: FeedbackCategory
  comment?: string
  ticketId?: string
  userId?: string
  createdAt: string
}

/**
 * Message draft state
 */
export interface MessageDraft {
  prompt: string
  context: MessageContext
  config: Partial<MessageConfig>
}

/**
 * AI feature store state
 */
export interface AIState {
  draft: MessageDraft | null
  generatedMessage: GeneratedMessage | null
  context: MessageContext | null
  feedback: Feedback[]
  isGenerating: boolean
  isSubmittingFeedback: boolean
  error: Error | null
}

/**
 * AI feature store actions
 */
export interface AIActions {
  // Draft management
  setDraft: (draft: MessageDraft) => void
  updateDraft: (updates: Partial<MessageDraft>) => void
  clearDraft: () => void
  
  // Message generation
  generateMessage: (prompt: string, context: MessageContext) => Promise<void>
  regenerateMessage: () => Promise<void>
  
  // Feedback management
  submitFeedback: (feedback: Omit<Feedback, 'createdAt'>) => Promise<void>
  getFeedback: (messageId: string) => Promise<void>
  
  // Error handling
  setError: (error: Error | null) => void
  reset: () => void
}

/**
 * Complete AI feature store type
 */
export interface AIStore extends AIState {
  actions: AIActions
} 