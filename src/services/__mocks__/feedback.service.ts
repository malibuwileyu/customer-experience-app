import { vi } from 'vitest';
import { FeedbackRating, FeedbackCategory } from '../feedback.service';

export { FeedbackRating, FeedbackCategory };

export class FeedbackService {
  submitFeedback = vi.fn();
  getFeedback = vi.fn();
  getFeedbackMetrics = vi.fn();
} 