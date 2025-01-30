// Mock must be defined before imports
vi.mock('../../services/message-generation.service');

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMessage, setMessageService } from '../message';
import { MessageGenerationService } from '../../services/message-generation.service';
import type { MessageContext } from '../../services/message-generation.service';

describe('Message Generation API', () => {
  let mockService: MessageGenerationService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = new MessageGenerationService();
    setMessageService(mockService);
  });

  describe('generateMessage', () => {
    it('should generate a message successfully', async () => {
      const prompt = 'How do I reset my password?';
      const context: MessageContext = {
        ticketId: 'test-ticket-123',
        customerId: 'test-user-123',
        previousMessages: [
          {
            role: 'customer',
            content: 'How do I reset my password?',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const mockResponse = {
        content: 'Here is how to reset your password...',
        context: {
          confidence: 0.95,
          usedArticles: ['article-1', 'article-2'],
          tone: 'helpful',
        },
      };

      vi.mocked(mockService.generateResponse).mockResolvedValueOnce(mockResponse);

      const request = new Request('http://localhost/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, context }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await generateMessage(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual(mockResponse);
      expect(mockService.generateResponse).toHaveBeenCalledWith(prompt, context);
    });

    it('should handle missing prompt', async () => {
      const request = new Request('http://localhost/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ context: {} }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await generateMessage(request);
      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual({ error: 'Prompt is required' });
      expect(mockService.generateResponse).not.toHaveBeenCalled();
    });

    it('should handle invalid request body', async () => {
      const request = new Request('http://localhost/api/ai/generate', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await generateMessage(request);
      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual({ error: 'Invalid request body' });
      expect(mockService.generateResponse).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const prompt = 'How do I reset my password?';
      const context = {};

      vi.mocked(mockService.generateResponse).mockRejectedValueOnce(new Error('Service error'));

      const request = new Request('http://localhost/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, context }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await generateMessage(request);
      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to generate message' });
      expect(mockService.generateResponse).toHaveBeenCalledWith(prompt, context);
    });
  });
}); 
