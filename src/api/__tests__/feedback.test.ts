// Mock must be defined before imports
vi.mock('../../services/feedback.service');

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitFeedback, getFeedback, getFeedbackMetrics, setFeedbackService } from '../feedback';
import { FeedbackService, FeedbackRating, FeedbackCategory } from '../../services/feedback.service';

describe('Feedback API', () => {
  let mockService: FeedbackService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = new FeedbackService();
    setFeedbackService(mockService);
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      const feedback = {
        messageId: '123',
        rating: FeedbackRating.GOOD,
        category: FeedbackCategory.ACCURACY,
        comment: 'Great response!',
      };

      const mockResponse = { ...feedback, created_at: new Date().toISOString() };
      vi.mocked(mockService.submitFeedback).mockResolvedValueOnce(mockResponse);

      const request = new Request('http://localhost/api/feedback', {
        method: 'POST',
        body: JSON.stringify(feedback),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await submitFeedback(request);
      expect(response.status).toBe(201);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual(mockResponse);
      expect(mockService.submitFeedback).toHaveBeenCalledWith(feedback);
    });

    it('should handle submission errors', async () => {
      const feedback = {
        messageId: '123',
        rating: FeedbackRating.GOOD,
        category: FeedbackCategory.ACCURACY,
      };

      vi.mocked(mockService.submitFeedback).mockRejectedValueOnce(new Error('Database error'));

      const request = new Request('http://localhost/api/feedback', {
        method: 'POST',
        body: JSON.stringify(feedback),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await submitFeedback(request);
      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to submit feedback' });
      expect(mockService.submitFeedback).toHaveBeenCalledWith(feedback);
    });
  });

  describe('getFeedback', () => {
    it('should retrieve feedback successfully', async () => {
      const messageId = '123';
      const mockFeedback = [{
        message_id: messageId,
        rating: FeedbackRating.EXCELLENT,
        category: FeedbackCategory.CLARITY,
        created_at: new Date().toISOString(),
      }];

      vi.mocked(mockService.getFeedback).mockResolvedValueOnce(mockFeedback);

      const request = new Request(`http://localhost/api/feedback?messageId=${messageId}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await getFeedback(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual(mockFeedback);
      expect(mockService.getFeedback).toHaveBeenCalledWith(messageId);
    });

    it('should require message ID', async () => {
      const request = new Request('http://localhost/api/feedback', {
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await getFeedback(request);
      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual({ error: 'Message ID is required' });
      expect(mockService.getFeedback).not.toHaveBeenCalled();
    });

    it('should handle retrieval errors', async () => {
      const messageId = '123';
      vi.mocked(mockService.getFeedback).mockRejectedValueOnce(new Error('Database error'));

      const request = new Request(`http://localhost/api/feedback?messageId=${messageId}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await getFeedback(request);
      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to retrieve feedback' });
      expect(mockService.getFeedback).toHaveBeenCalledWith(messageId);
    });
  });

  describe('getFeedbackMetrics', () => {
    it('should retrieve metrics successfully', async () => {
      const mockMetrics = {
        totalFeedback: 2,
        averageRating: 3.5,
        ratingDistribution: {
          [FeedbackRating.POOR]: 0,
          [FeedbackRating.FAIR]: 0,
          [FeedbackRating.GOOD]: 1,
          [FeedbackRating.EXCELLENT]: 1,
        },
        categoryBreakdown: {
          [FeedbackCategory.ACCURACY]: 1,
          [FeedbackCategory.CLARITY]: 1,
          [FeedbackCategory.COMPLETENESS]: 0,
          [FeedbackCategory.RELEVANCE]: 0,
          [FeedbackCategory.TONE]: 0,
        },
      };

      vi.mocked(mockService.getFeedbackMetrics).mockResolvedValueOnce(mockMetrics);

      const request = new Request('http://localhost/api/feedback/metrics', {
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await getFeedbackMetrics(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual(mockMetrics);
      expect(mockService.getFeedbackMetrics).toHaveBeenCalledWith({
        ticketId: undefined,
        userId: undefined,
        category: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should apply filters correctly', async () => {
      const filters = {
        ticketId: 'ticket123',
        userId: 'user123',
        category: FeedbackCategory.TONE,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const mockMetrics = {
        totalFeedback: 0,
        averageRating: 0,
        ratingDistribution: {
          [FeedbackRating.POOR]: 0,
          [FeedbackRating.FAIR]: 0,
          [FeedbackRating.GOOD]: 0,
          [FeedbackRating.EXCELLENT]: 0,
        },
        categoryBreakdown: {
          [FeedbackCategory.ACCURACY]: 0,
          [FeedbackCategory.CLARITY]: 0,
          [FeedbackCategory.COMPLETENESS]: 0,
          [FeedbackCategory.RELEVANCE]: 0,
          [FeedbackCategory.TONE]: 0,
        },
      };

      vi.mocked(mockService.getFeedbackMetrics).mockResolvedValueOnce(mockMetrics);

      const url = new URL('http://localhost/api/feedback/metrics');
      Object.entries(filters).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const request = new Request(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await getFeedbackMetrics(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual(mockMetrics);
      expect(mockService.getFeedbackMetrics).toHaveBeenCalledWith(filters);
    });

    it('should handle metrics retrieval errors', async () => {
      vi.mocked(mockService.getFeedbackMetrics).mockRejectedValueOnce(new Error('Database error'));

      const request = new Request('http://localhost/api/feedback/metrics', {
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await getFeedbackMetrics(request);
      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to retrieve feedback metrics' });
      expect(mockService.getFeedbackMetrics).toHaveBeenCalledWith({
        ticketId: undefined,
        userId: undefined,
        category: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });
  });
}); 