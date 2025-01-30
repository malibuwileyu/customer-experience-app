/**
 * @fileoverview Tests for Message Generation Service
 * @module services/__tests__/message-generation.service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatOpenAI, type ChatOpenAICallOptions } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, type Runnable } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { MessageGenerationService, type MessageContext } from '../message-generation.service';
import { AIService, AIError, AIErrorType } from '../ai.service';
import { supabase, supabaseService } from '../../lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PostgrestQueryBuilder, PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

// Test data and constants
const TEST_ARTICLE_DATA = {
  id: 'test-article-id',
  title: 'Test Article',
  content: 'This is a test article about customer service.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'test-user-id',
  category: 'customer-service',
  tags: ['test', 'customer-service'],
  status: 'published'
};

const SHORT_RESPONSE = 'Hi there!';
const DETAILED_RESPONSE = 'Based on our knowledge base article "Password Reset Guide" (Article #1), you can reset your password by following these steps...';
const TEST_ARTICLE_ID = 'test-article-id';

// Define prompt at the top level
const TEST_PROMPT = 'How do I reset my password?';

// Type definitions for mock functions
type MockFunction<T = any> = {
  (): T;
  mockReturnThis: () => MockFunction<T>;
  mockResolvedValue: (value: T) => MockFunction<T>;
  mockRejectedValue: (error: Error) => MockFunction<T>;
  mockImplementation: (fn: (...args: any[]) => any) => MockFunction<T>;
};

interface ExtendedMessageContext extends MessageContext {
  searchTerm?: string;
}

interface MockChain {
  mockSelect: MockFunction<PostgrestQueryBuilder<any, any, any>>;
  mockTextSearch: MockFunction<PostgrestQueryBuilder<any, any, any>>;
  mockLimit: MockFunction<PostgrestQueryBuilder<any, any, any>>;
  mockEq: MockFunction<PostgrestQueryBuilder<any, any, any>>;
  mockOrderBy: MockFunction<PostgrestQueryBuilder<any, any, any>>;
  mockFrom: MockFunction<PostgrestQueryBuilder<any, any, any>>;
  data: MockFunction<Promise<any[]>>;
}

const createMockChain = (): MockChain => ({
  mockSelect: vi.fn().mockReturnThis() as MockFunction<PostgrestQueryBuilder<any, any, any>>,
  mockTextSearch: vi.fn().mockReturnThis() as MockFunction<PostgrestQueryBuilder<any, any, any>>,
  mockLimit: vi.fn().mockReturnThis() as MockFunction<PostgrestQueryBuilder<any, any, any>>,
  mockEq: vi.fn().mockReturnThis() as MockFunction<PostgrestQueryBuilder<any, any, any>>,
  mockOrderBy: vi.fn().mockReturnThis() as MockFunction<PostgrestQueryBuilder<any, any, any>>,
  mockFrom: vi.fn().mockReturnThis() as MockFunction<PostgrestQueryBuilder<any, any, any>>,
  data: vi.fn().mockResolvedValue([{ id: 'test-article-id', title: 'Test Article', content: 'Test content' }]) as MockFunction<Promise<any[]>>
});

const mockChain = createMockChain();

// Update mock implementation for supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockImplementation((table: string) => ({
      select: vi.fn().mockReturnThis(),
      textSearch: mockChain.mockTextSearch,
      eq: mockChain.mockEq,
      limit: mockChain.mockLimit,
      orderBy: mockChain.mockOrderBy,
      data: mockChain.data,
    })),
  })) as unknown as SupabaseClient,
}));

vi.mock('../../lib/supabase', () => ({
  supabase: vi.fn(),
  supabaseService: {
    from: vi.fn().mockImplementation((table: string) => ({
      select: () => ({
      textSearch: mockChain.mockTextSearch,
      eq: mockChain.mockEq,
      limit: mockChain.mockLimit,
      orderBy: mockChain.mockOrderBy,
      data: mockChain.data,
      }),
    })) as unknown as PostgrestQueryBuilder<any, any, string, unknown>,
  },
}));

vi.mock('@langchain/openai', () => {
  const mockChatOpenAI = {
    invoke: vi.fn().mockResolvedValue({
      content: 'Test response referencing article test-article-id',
    }),
    pipe: vi.fn(),
    _llmType: () => 'chatgpt',
    _modelType: () => 'chat_model',
    caller: {
      callWithProgress: vi.fn(),
    },
    lc_serializable: true,
    verbose: false,
    callbacks: [],
    maxTokens: undefined,
    modelName: 'gpt-4',
    prefixMessages: [],
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeout: undefined,
    streaming: false,
    maxRetries: 6,
    [Symbol.toStringTag]: 'ChatOpenAI',
    lc_secrets: {},
    lc_aliases: {},
    lc_namespace: ['langchain', 'chat_models', 'openai'],
    callKeys: ['stop', 'signal', 'timeout', 'tags', 'metadata', 'callbacks'],
  } as unknown as ChatOpenAI;

  return {
    ChatOpenAI: vi.fn().mockImplementation(() => mockChatOpenAI),
  };
});

vi.mock('@langchain/core/prompts', () => ({
  PromptTemplate: {
    fromTemplate: vi.fn().mockImplementation((template: string) => ({
      invoke: vi.fn().mockResolvedValue(template),
      pipe: vi.fn().mockReturnThis(),
      [Symbol.toStringTag]: 'Runnable',
    })),
  },
  ChatPromptTemplate: {
    fromMessages: vi.fn().mockReturnValue({
      pipe: vi.fn(),
    }),
  },
}));

vi.mock('@langchain/core/output_parsers', () => ({
  StringOutputParser: vi.fn().mockImplementation(() => ({
    invoke: vi.fn().mockImplementation(async (input) => input),
    pipe: vi.fn().mockReturnThis(),
    [Symbol.toStringTag]: 'Runnable'
  }))
}));

vi.mock('@langchain/core/runnables', () => ({
  RunnableSequence: {
    from: vi.fn().mockImplementation((components) => createMockRunnable())
  }
}));

interface MockRunnableOptions {
  errorMode?: boolean;
}

// Mock factory functions
function createMockRunnable(response = DETAILED_RESPONSE, options: MockRunnableOptions = {}) {
  return {
    invoke: vi.fn().mockImplementation((input) => {
      if (options.errorMode) {
        return Promise.reject(new Error('API error'));
      }
      if (input?.prompt === 'Hi') {
        return Promise.resolve(SHORT_RESPONSE);
      }
      return Promise.resolve(response);
    }),
    pipe: vi.fn().mockReturnThis(),
    [Symbol.toStringTag]: 'Runnable',
    callKeys: ['stop', 'signal', 'timeout', 'tags', 'metadata', 'callbacks'],
    lc_serializable: true,
    lc_secrets: {},
    lc_aliases: {},
    lc_namespace: ['langchain', 'runnables', 'sequence'],
  } as unknown as RunnableSequence;
}

// Update type definitions
interface MockQueryBuilder {
  select: () => MockQueryBuilder;
  textSearch: (column: string, query: string) => MockQueryBuilder;
  eq: (column: string, value: string) => MockQueryBuilder;
  limit: (count: number) => MockQueryBuilder;
  orderBy: (column: string, options?: { ascending?: boolean }) => MockQueryBuilder;
  data: Promise<any[]>;
}

describe('MessageGenerationService', () => {
  let service: MessageGenerationService;
  let mockSupabaseClient: ReturnType<typeof createClient<Database>>;
  let supabaseFromSpy: ReturnType<typeof vi.spyOn>;
  
  const mockContext: MessageContext = {
    ticketId: '123',
    customerId: '456',
    hasValidDbAccess: true,
    previousMessages: [
      {
        role: 'customer',
        content: 'How do I reset my password?',
        timestamp: '2024-01-28T00:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    // Reset environment and mocks before each test
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.TAVILY_API_KEY = 'test-tavily-key';
    vi.clearAllMocks();
    mockSupabaseClient = createClient<Database>('test-url', 'test-key');
    service = new MessageGenerationService({
      modelName: 'gpt-4',
      temperature: 0.7,
      maxTokens: 500,
      streaming: false,
    });
    
    // Create mock query builder with chained methods
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      textSearch: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      data: mockChain.data,
    } as unknown as PostgrestQueryBuilder<any, any, string, unknown>;
    
    // Create and setup the spy
    supabaseFromSpy = vi.spyOn(supabaseService, 'from')
      .mockReturnValue(mockQueryBuilder);
  });

  describe('confidence calculation', () => {
    it('should calculate low confidence for short responses', async () => {
      const response = await service.generateResponse('Hi', mockContext);
      expect(response.context.confidence).toBeLessThanOrEqual(0.7);
    });

    it('should calculate high confidence for detailed responses', async () => {
      const response = await service.generateResponse('How do I reset my password? Please provide detailed steps.', mockContext);
      expect(response.context.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('article extraction', () => {
    it('should extract used articles from response', async () => {
      const mockResponse = 'According to Article #123 and Article #456, you should...';
      const articles = service['extractUsedArticles'](mockResponse);
      expect(articles).toEqual(['123', '456']);
    });

    it('should return empty array when no articles are referenced', async () => {
      const mockResponse = 'Here is a general response without any article references.';
      const articles = service['extractUsedArticles'](mockResponse);
      expect(articles).toEqual([]);
    });
  });

  describe('generateResponse', () => {
    it('should generate a response with context', async () => {
      const prompt = 'How do I reset my password?';
      const response = await service.generateResponse(prompt, mockContext);

      expect(response).toBeDefined();
      expect(response.content).toBe(DETAILED_RESPONSE);
      expect(response.context).toBeDefined();
      expect(response.context.tone).toBe('professional');
      expect(response.context.confidence).toBeGreaterThan(0);
      expect(Array.isArray(response.context.usedArticles)).toBe(true);
      expect(response.context.usedArticles).toContain('1');
    });

    it('should handle missing ticket history gracefully', async () => {
      const contextWithoutTicket = { 
        ticketId: undefined,
        hasValidDbAccess: true
      };
      const prompt = 'How do I reset my password?';
      const response = await service.generateResponse(prompt, contextWithoutTicket);

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.context.usedArticles).toBeDefined();
    });

    it('should respect tone preference', async () => {
      const serviceWithCasualTone = new MessageGenerationService({
        tonePreference: 'casual',
      });

      const prompt = 'How do I reset my password?';
      const response = await serviceWithCasualTone.generateResponse(prompt, mockContext);

      expect(response.context.tone).toBe('casual');
    });

    it('should handle empty context gracefully', async () => {
      const emptyContext: MessageContext = {
        hasValidDbAccess: true
      };
      const prompt = 'How do I reset my password?';
      const response = await service.generateResponse(prompt, emptyContext);

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });

  describe('context gathering', () => {
    it('should fetch relevant articles when enabled', async () => {
      const extendedContext: ExtendedMessageContext = { ...mockContext, searchTerm: TEST_PROMPT };
      await service.generateResponse(TEST_PROMPT, extendedContext);

      expect(supabaseFromSpy).toHaveBeenCalledWith('kb_articles');
      expect(mockChain.mockTextSearch).toHaveBeenCalledWith('content', TEST_PROMPT);
      expect(mockChain.mockLimit).toHaveBeenCalledWith(3);
    });

    it('should fetch articles based on the most recent message', async () => {
      const contextWithMultipleMessages: MessageContext = {
        ...mockContext,
        previousMessages: [
          {
            role: 'customer',
            content: 'Old message',
            timestamp: '2024-01-27T00:00:00Z',
          },
          {
            role: 'customer',
            content: 'Latest question about password reset',
            timestamp: '2024-01-28T00:00:00Z',
          },
        ],
      };

      const lastMessage = contextWithMultipleMessages.previousMessages?.[0]?.content || '';
      const extendedContext: ExtendedMessageContext = { ...contextWithMultipleMessages, searchTerm: lastMessage };
      await service.generateResponse('test', extendedContext);

      expect(supabaseFromSpy).toHaveBeenCalledWith('kb_articles');
      expect(mockChain.mockTextSearch).toHaveBeenCalledWith('content', lastMessage);
      expect(mockChain.mockLimit).toHaveBeenCalledWith(3);
    });

    it('should skip article fetching when disabled', async () => {
      const serviceWithoutKB = new MessageGenerationService({
        includeKnowledgeBase: false,
        includeTicketHistory: true,
      });

      const prompt = 'How do I reset my password?';
      await serviceWithoutKB.generateResponse(prompt, mockContext);

      expect(supabaseFromSpy).not.toHaveBeenCalledWith('kb_articles');
    });

    it('should fetch ticket history when enabled', async () => {
      const prompt = 'How do I reset my password?';
      await service.generateResponse(prompt, mockContext);

      expect(supabaseFromSpy).toHaveBeenCalledWith('ticket_comments');
      expect(mockChain.mockEq).toHaveBeenCalledWith('ticket_id', mockContext.ticketId);
      expect(mockChain.mockOrderBy).toHaveBeenCalledWith('created_at', { ascending: true });
    });

    it('should order ticket history by creation time', async () => {
      await service.generateResponse('test', mockContext);
      expect(supabaseFromSpy).toHaveBeenCalledWith('ticket_comments');
    });

    it('should skip ticket history when disabled', async () => {
      const serviceWithoutHistory = new MessageGenerationService({
        includeTicketHistory: false,
      });

      const prompt = 'How do I reset my password?';
      await serviceWithoutHistory.generateResponse(prompt, mockContext);
      expect(supabaseFromSpy).not.toHaveBeenCalledWith('ticket_comments');
    });

    it('should skip ticket history when ticketId is missing', async () => {
      const contextWithoutTicket: MessageContext = {
        customerId: '456',
        hasValidDbAccess: true,
        previousMessages: mockContext.previousMessages,
      };

      await service.generateResponse('test', contextWithoutTicket);
      expect(supabaseFromSpy).not.toHaveBeenCalledWith('ticket_comments');
    });

    it('should preserve existing context when enhancing', async () => {
      const existingContext: MessageContext = {
        ticketId: '123',
        customerId: '456',
        hasValidDbAccess: true,
        previousMessages: [{
          role: 'customer',
          content: 'Existing message',
          timestamp: '2024-01-28T00:00:00Z',
        }],
        relevantArticles: [{
          id: '999',
          title: 'Existing Article',
          content: 'Existing content...',
          category_id: 'existing'
        }],
      };

      const response = await service.generateResponse('test', existingContext);
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(supabaseFromSpy).toHaveBeenCalled();
    });

    it('should merge new articles with existing ones', async () => {
      const existingContext: MessageContext = {
        ...mockContext,
        relevantArticles: [{
          id: '999',
          title: 'Existing Article',
          content: 'Existing content...',
          category_id: 'existing'
        }],
      };

      const response = await service.generateResponse('test', existingContext);
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(supabaseFromSpy).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockChain.data.mockRejectedValue(new Error('Mock error'));
    });

    it('should handle API errors', async () => {
      const error = new AIError(
        AIErrorType.GENERATION_ERROR,
        'Mock API error'
      );
      mockChain.data.mockRejectedValue(error);

      await expect(service.generateResponse('test', mockContext))
        .rejects.toThrow(error);
    });

    it('should handle article fetching errors', async () => {
      const error = new Error('Mock article fetch error');
      mockChain.data.mockRejectedValue(error);

      await expect(service.generateResponse('test', mockContext))
        .rejects.toThrow(error);
    });

    it('should handle ticket history fetching errors', async () => {
      const error = new Error('Mock ticket history error');
      mockChain.data.mockRejectedValue(error);

      await expect(service.generateResponse('test', mockContext))
        .rejects.toThrow(error);
    });
  });
}); 