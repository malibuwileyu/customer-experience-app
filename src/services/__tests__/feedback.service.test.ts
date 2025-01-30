import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FeedbackService, FeedbackRating, FeedbackCategory, type Feedback } from '../feedback.service';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockGte = vi.fn();
  const mockLte = vi.fn();
  const mockSingle = vi.fn();

  // Setup mock chain
  mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });
  mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle });
  mockInsert.mockReturnValue({ select: mockSelect });
  mockEq.mockReturnValue({ eq: mockEq, order: mockOrder, gte: mockGte });
  mockOrder.mockReturnValue({ gte: mockGte });
  mockGte.mockReturnValue({ lte: mockLte });
  mockLte.mockResolvedValue({ data: [], error: null });
  mockSingle.mockResolvedValue({ data: {}, error: null });

  return {
    supabase: {
      from: mockFrom,
      __mocks: {
        mockFrom,
        mockSelect,
        mockInsert,
        mockEq,
        mockOrder,
        mockGte,
        mockLte,
        mockSingle,
      },
    },
  };
});

describe('FeedbackService', () => {
  let service: FeedbackService;
  const {
    mockFrom,
    mockSelect,
    mockInsert,
    mockEq,
    mockOrder,
    mockGte,
    mockLte,
    mockSingle,
  } = (supabase as any).__mocks;

  beforeEach(() => {
    service = new FeedbackService();
    vi.clearAllMocks();

    // Reset mock chain
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockEq.mockReturnValue({ eq: mockEq, order: mockOrder, gte: mockGte });
    mockOrder.mockReturnValue({ gte: mockGte });
    mockGte.mockReturnValue({ lte: mockLte });
    mockLte.mockResolvedValue({ data: [], error: null });
    mockSingle.mockResolvedValue({ data: {}, error: null });
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      const feedback: Feedback = {
        messageId: '123',
        rating: FeedbackRating.GOOD,
        category: FeedbackCategory.ACCURACY,
        comment: 'Great response!',
        userId: 'user123',
        ticketId: 'ticket123',
      };

      const mockResponse = { ...feedback, created_at: new Date().toISOString() };
      mockSingle.mockResolvedValueOnce({ data: mockResponse, error: null });

      const result = await service.submitFeedback(feedback);

      expect(mockFrom).toHaveBeenCalledWith('ai_feedback');
      expect(mockInsert).toHaveBeenCalledWith({
        message_id: feedback.messageId,
        rating: feedback.rating,
        category: feedback.category,
        comment: feedback.comment,
        user_id: feedback.userId,
        ticket_id: feedback.ticketId,
        metadata: undefined,
        created_at: expect.any(String),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle submission errors', async () => {
      const feedback: Feedback = {
        messageId: '123',
        rating: FeedbackRating.GOOD,
        category: FeedbackCategory.ACCURACY,
      };

      mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Database error') });

      await expect(service.submitFeedback(feedback)).rejects.toThrow('Database error');
    });
  });

  describe('getFeedback', () => {
    it('should retrieve feedback for a message', async () => {
      const messageId = '123';
      const mockFeedback = [{
        message_id: messageId,
        rating: FeedbackRating.EXCELLENT,
        category: FeedbackCategory.CLARITY,
        created_at: new Date().toISOString(),
      }];

      mockOrder.mockResolvedValueOnce({ data: mockFeedback, error: null });

      const result = await service.getFeedback(messageId);

      expect(mockFrom).toHaveBeenCalledWith('ai_feedback');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('message_id', messageId);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockFeedback);
    });

    it('should handle retrieval errors', async () => {
      mockOrder.mockResolvedValueOnce({ data: null, error: new Error('Not found') });

      await expect(service.getFeedback('123')).rejects.toThrow('Not found');
    });
  });

  describe('getFeedbackMetrics', () => {
    it('should retrieve metrics with no filters', async () => {
      const mockData = [
        { rating: FeedbackRating.GOOD, category: FeedbackCategory.ACCURACY },
        { rating: FeedbackRating.EXCELLENT, category: FeedbackCategory.CLARITY },
      ];

      mockSelect.mockResolvedValueOnce({ data: mockData, error: null, count: 2 });

      const result = await service.getFeedbackMetrics();

      expect(mockFrom).toHaveBeenCalledWith('ai_feedback');
      expect(mockSelect).toHaveBeenCalledWith('rating, category', { count: 'exact' });
      expect(result).toEqual({
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

      // Setup mock chain for filtered query
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

      mockSelect.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ gte: mockGte });
      mockGte.mockReturnValueOnce({ lte: mockLte });
      mockLte.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      const result = await service.getFeedbackMetrics(filters);

      expect(mockFrom).toHaveBeenCalledWith('ai_feedback');
      expect(mockSelect).toHaveBeenCalledWith('rating, category', { count: 'exact' });
      expect(mockEq).toHaveBeenCalledWith('ticket_id', filters.ticketId);
      expect(mockEq).toHaveBeenCalledWith('user_id', filters.userId);
      expect(mockEq).toHaveBeenCalledWith('category', filters.category);
      expect(mockGte).toHaveBeenCalledWith('created_at', filters.startDate);
      expect(mockLte).toHaveBeenCalledWith('created_at', filters.endDate);
      expect(result).toEqual(mockMetrics);
    });

    it('should handle metrics retrieval errors', async () => {
      mockSelect.mockResolvedValueOnce({ data: null, error: new Error('Database error') });

      await expect(service.getFeedbackMetrics()).rejects.toThrow('Database error');
    });
  });
}); 