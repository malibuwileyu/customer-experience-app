/**
 * @fileoverview Tests for Core AI Service
 * @module services/__tests__/ai.service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, type Runnable } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { AIService, AIConfig, AIError, AIErrorType } from '../ai.service';

// Mock responses
const TEST_RESPONSE = 'Test response';
const TEST_PROMPT = 'Test prompt';

// Mock factory functions
function createMockRunnable(response = TEST_RESPONSE) {
  return {
    invoke: vi.fn().mockResolvedValue(response),
    pipe: vi.fn().mockReturnThis(),
    [Symbol.toStringTag]: 'Runnable'
  };
}

// Mock LangChain components
vi.mock('@langchain/openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => createMockRunnable())
}));

vi.mock('@langchain/core/prompts', () => ({
  PromptTemplate: vi.fn().mockImplementation(() => createMockRunnable(TEST_PROMPT))
}));

vi.mock('@langchain/core/output_parsers', () => ({
  StringOutputParser: vi.fn().mockImplementation(() => createMockRunnable())
}));

vi.mock('@langchain/core/runnables', () => ({
  RunnableSequence: {
    from: vi.fn().mockImplementation(() => createMockRunnable())
  }
}));

vi.mock('@langchain/community/tools/tavily_search', () => ({
  TavilySearchResults: vi.fn().mockImplementation(() => ({
    invoke: vi.fn().mockResolvedValue('Search results'),
  })),
}));

describe('AIService', () => {
  let service: AIService;
  const mockConfig: AIConfig = {
    temperature: 0.5,
    maxTokens: 100,
    modelName: 'gpt-4-turbo-preview',
    streaming: false,
  };

  beforeEach(() => {
    // Reset environment and mocks before each test
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.TAVILY_API_KEY = 'test-tavily-key';
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      service = new AIService();
      expect(service).toBeInstanceOf(AIService);
      expect(OpenAI).toHaveBeenCalledWith(expect.objectContaining({
        modelName: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 500,
        streaming: false,
      }));
    });

    it('should initialize with custom config', () => {
      service = new AIService(mockConfig);
      expect(service).toBeInstanceOf(AIService);
      expect(OpenAI).toHaveBeenCalledWith(expect.objectContaining(mockConfig));
    });

    it('should throw error if OpenAI API key is missing', () => {
      process.env.OPENAI_API_KEY = '';
      expect(() => new AIService()).toThrow(AIError);
      expect(() => new AIService()).toThrow('OpenAI API key is not configured');
    });

    it('should throw error if Tavily API key is missing', () => {
      process.env.TAVILY_API_KEY = '';
      expect(() => new AIService()).toThrow(AIError);
      expect(() => new AIService()).toThrow('Tavily API key is not configured');
    });
  });

  describe('chain creation', () => {
    beforeEach(() => {
      service = new AIService(mockConfig);
    });

    it('should create a chain with template and variables', async () => {
      const template = 'Test template with {variable}';
      const variables = ['variable'];
      const chain = await service['createChain'](template, variables);
      
      expect(chain).toBeDefined();
      expect(typeof chain.invoke).toBe('function');
      
      // Test chain functionality
      const result = await chain.invoke({ variable: 'test' });
      expect(result).toBe(TEST_RESPONSE);
    });

    it('should create a sequence with components', async () => {
      const mockPrompt = new PromptTemplate({
        template: 'Test template',
        inputVariables: [],
      });
      const mockChain = mockPrompt.pipe(service['openai']);
      const sequence = service['createSequence']([mockChain]);
      
      expect(sequence).toBeDefined();
      expect(typeof sequence.invoke).toBe('function');
      
      // Test sequence functionality with input
      const result = await sequence.invoke({});
      expect(result).toBe(TEST_RESPONSE);
    });

    it('should throw error when creating sequence with no components', () => {
      expect(() => service['createSequence']([])).toThrow(AIError);
      expect(() => service['createSequence']([])).toThrow('Sequence must have at least one component');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      service = new AIService(mockConfig);
    });

    it('should handle rate limit errors', () => {
      const error = {
        response: { status: 429 },
        message: 'Rate limit exceeded',
      };

      expect(() => service['handleError'](error)).toThrow(AIError);
      expect(() => service['handleError'](error)).toThrow('AI service rate limit exceeded');
    });

    it('should handle context length errors', () => {
      const error = {
        message: 'maximum context length exceeded',
      };

      expect(() => service['handleError'](error)).toThrow(AIError);
      expect(() => service['handleError'](error)).toThrow('Input exceeds maximum context length');
    });

    it('should handle general API errors', () => {
      const error = {
        response: { status: 500 },
        message: 'Internal server error',
      };

      expect(() => service['handleError'](error)).toThrow(AIError);
      expect(() => service['handleError'](error)).toThrow('AI generation failed');
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');

      expect(() => service['handleError'](error)).toThrow(AIError);
      expect(() => service['handleError'](error)).toThrow('Unknown AI error occurred');
    });
  });
}); 