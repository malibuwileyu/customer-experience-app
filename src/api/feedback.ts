/**
 * @fileoverview Feedback API endpoints for OutreachGPT
 * @module api/feedback
 * @description
 * Handles feedback submission and retrieval for AI-generated responses.
 */

import { FeedbackService, type Feedback } from '../services/feedback.service';

// Create a single instance of the service
let feedbackService = new FeedbackService();

// For testing purposes
export function setFeedbackService(service: FeedbackService) {
  feedbackService = service;
}

/**
 * Submit feedback for an AI response
 */
export async function submitFeedback(request: Request) {
  try {
    const feedback = await request.json() as Feedback;
    try {
      const result = await feedbackService.submitFeedback(feedback);
      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      return new Response(JSON.stringify({ error: 'Failed to submit feedback' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Invalid request body:', error);
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Get feedback for a specific message
 */
export async function getFeedback(request: Request) {
  try {
    const url = new URL(request.url);
    const messageId = url.searchParams.get('messageId');

    if (!messageId) {
      return new Response(JSON.stringify({ error: 'Message ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const feedback = await feedbackService.getFeedback(messageId);
      return new Response(JSON.stringify(feedback), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to retrieve feedback:', error);
      return new Response(JSON.stringify({ error: 'Failed to retrieve feedback' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Invalid request:', error);
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Get feedback metrics with optional filters
 */
export async function getFeedbackMetrics(request: Request) {
  try {
    const url = new URL(request.url);
    const filters = {
      ticketId: url.searchParams.get('ticketId') || undefined,
      userId: url.searchParams.get('userId') || undefined,
      category: url.searchParams.get('category') as any || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
    };

    try {
      const metrics = await feedbackService.getFeedbackMetrics(filters);
      return new Response(JSON.stringify(metrics), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to retrieve feedback metrics:', error);
      return new Response(JSON.stringify({ error: 'Failed to retrieve feedback metrics' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Invalid request:', error);
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 