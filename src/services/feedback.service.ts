/**
 * @fileoverview Feedback Service for OutreachGPT
 * @module services/feedback
 * @description
 * Handles the collection and storage of feedback for AI-generated responses,
 * enabling continuous improvement of the system.
 */

import { supabase } from '../lib/supabase';

/**
 * Feedback rating scale
 */
export enum FeedbackRating {
  POOR = 1,
  FAIR = 2,
  GOOD = 3,
  EXCELLENT = 4,
}

/**
 * Feedback categories for AI responses
 */
export enum FeedbackCategory {
  ACCURACY = 'accuracy',
  RELEVANCE = 'relevance',
  TONE = 'tone',
  CLARITY = 'clarity',
  COMPLETENESS = 'completeness',
}

/**
 * Feedback data structure
 */
export interface Feedback {
  messageId: string;
  rating: FeedbackRating;
  category: FeedbackCategory;
  comment?: string;
  userId?: string;
  ticketId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Service for handling AI response feedback
 */
export class FeedbackService {
  /**
   * Submits feedback for an AI-generated response
   * @param feedback The feedback data to submit
   * @returns The submitted feedback record
   */
  public async submitFeedback(feedback: Feedback) {
    try {
      const { data, error } = await supabase
        .from('ai_feedback')
        .insert({
          message_id: feedback.messageId,
          rating: feedback.rating,
          category: feedback.category,
          comment: feedback.comment,
          user_id: feedback.userId,
          ticket_id: feedback.ticketId,
          metadata: feedback.metadata,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  }

  /**
   * Retrieves feedback for a specific message
   * @param messageId The ID of the message
   * @returns Array of feedback records
   */
  public async getFeedback(messageId: string) {
    try {
      const { data, error } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to retrieve feedback:', error);
      throw error;
    }
  }

  /**
   * Retrieves aggregated feedback metrics
   * @param filters Optional filters for the metrics
   * @returns Aggregated feedback metrics
   */
  public async getFeedbackMetrics(filters?: {
    ticketId?: string;
    userId?: string;
    category?: FeedbackCategory;
    startDate?: string;
    endDate?: string;
    messageIds?: string[];
  }) {
    try {
      let query = supabase
        .from('ai_feedback')
        .select('rating, category', { count: 'exact' });

      if (filters?.ticketId) {
        query = query.eq('ticket_id', filters.ticketId);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters?.messageIds) {
        query = query.in('message_id', filters.messageIds);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Initialize metrics with default values
      const metrics = {
        totalFeedback: count || 0,
        averageRating: 0,
        ratingDistribution: {
          [FeedbackRating.POOR]: 0,
          [FeedbackRating.FAIR]: 0,
          [FeedbackRating.GOOD]: 0,
          [FeedbackRating.EXCELLENT]: 0,
        },
        categoryBreakdown: Object.values(FeedbackCategory).reduce((acc, category) => {
          acc[category] = 0;
          return acc;
        }, {} as Record<FeedbackCategory, number>),
      };

      if (data && data.length > 0) {
        // Calculate average rating
        const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
        metrics.averageRating = Math.round(totalRating / data.length);

        // Calculate rating distribution and category breakdown
        data.forEach(item => {
          metrics.ratingDistribution[item.rating as FeedbackRating]++;
          metrics.categoryBreakdown[item.category as FeedbackCategory]++;
        });
      }

      return metrics;
    } catch (error) {
      console.error('Failed to retrieve feedback metrics:', error);
      throw error;
    }
  }
} 