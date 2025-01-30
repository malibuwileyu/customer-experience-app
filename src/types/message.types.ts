/**
 * @fileoverview Message types for OutreachGPT
 * @module types/message
 * @description
 * Type definitions for messages, message contexts, and feedback
 * used throughout the OutreachGPT feature.
 */

import { FeedbackRating, FeedbackCategory } from '@/services/feedback.service'

export type MessageTone = 'professional' | 'friendly' | 'casual' | 'formal'

export interface MessageContext {
  tone: MessageTone
  ticketId: string | null
  customerId: string | null
  previousMessages: string[]
  confidence?: number
  usedArticles?: string[]
}

export interface Draft {
  prompt: string
  context: MessageContext
}

export interface GeneratedMessage {
  id: string
  content: string
  context: MessageContext & {
    confidence: number
    usedArticles: string[]
  }
}

export interface Feedback {
  messageId: string
  rating: FeedbackRating
  category: FeedbackCategory
  comment?: string
} 