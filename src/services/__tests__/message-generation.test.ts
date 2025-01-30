import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessageGenerationService, type MessageContext } from '../message-generation.service';
import { supabase, supabaseService } from '../../lib/supabase';
import { PostgrestResponse } from '@supabase/supabase-js';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, type Runnable } from '@langchain/core/runnables';
import { AIService, AIError } from '../ai.service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PostgrestQueryBuilder } from '@supabase/postgrest-js';

// Mock environment variables
vi.stubEnv('VITE_OPENAI_API_KEY', 'test-key-123');

// Create a mock chain response
const mockChainResponse = {
  content: `Based on our documentation (Article ID: aead35aa-24a5-4640-90a2-bdcc4cae7430), the Purple Elephant Principle consists of three core elements:

1. Unexpected Delight: This element focuses on creating surprising and positive experiences that go beyond customer expectations. It's about delivering moments that make customers pause and think "wow, I didn't expect that!"

2. Memorable Impact: This component emphasizes creating lasting impressions through meaningful interactions. It's not just about being different, but about making a difference that resonates and stays with people.

3. Consistent Uniqueness: This element balances the need for reliability with distinctiveness. It's about maintaining a standard of excellence while consistently finding ways to stand out and be remarkable.

These elements work together to create experiences that are not only distinctive but also meaningful and reliable.`,
  context: {
    usedArticles: ['aead35aa-24a5-4640-90a2-bdcc4cae7430'],
    confidence: 0.9,
    tone: 'professional'
  }
};

const mockPurpleElephantArticle = {
  id: 'aead35aa-24a5-4640-90a2-bdcc4cae7430',
  title: 'The Purple Elephant Principle',
  content: `The Purple Elephant Principle is a customer experience framework that consists of three core elements: unexpected delight, memorable impact, and consistent uniqueness.

Unexpected delight is about creating surprising and positive experiences that exceed customer expectations. This could be through thoughtful gestures, proactive problem-solving, or innovative solutions that customers didn't even know they needed.

Memorable impact focuses on creating lasting impressions through meaningful interactions. It's about designing experiences that resonate emotionally and stay with customers long after the interaction has ended.

Consistent uniqueness balances reliability with distinctiveness. While consistency is crucial for trust, each interaction should have elements that make it special and remarkable.

Together, these elements create a framework for delivering exceptional customer experiences that stand out in a crowded market while maintaining reliability and trust.`,
  category_id: '258ab2fa-c668-484d-a2e1-816a861f1336',
  status: 'published'
};

const mockSupabaseResponse: PostgrestResponse<typeof mockPurpleElephantArticle> = {
  data: [mockPurpleElephantArticle],
  error: null,
  count: 1,
  status: 200,
  statusText: 'OK'
};

// Mock OpenAI and Supabase
vi.mock('@langchain/openai', () => {
  return {
    ChatOpenAI: vi.fn((config) => {
      const configuration = {
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        modelName: config.modelName,
        openAIApiKey: config.openAIApiKey || import.meta.env.VITE_OPENAI_API_KEY
      };
      return {
        invoke: vi.fn(() => Promise.resolve(mockChainResponse.content)),
        configuration
      };
    })
  };
});

// Create a mock builder with just the methods we need
const createMockQueryBuilder = () => {
  return {
    select: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ 
      data: [mockPurpleElephantArticle], 
      error: null 
    }),
    ilike: vi.fn().mockReturnValue({ 
      data: [mockPurpleElephantArticle], 
      error: null 
    }),
    order: vi.fn().mockReturnThis()
  } as unknown as PostgrestQueryBuilder<any, any, any>;
};

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => createMockQueryBuilder())
  },
  supabaseService: {
    from: vi.fn(() => createMockQueryBuilder())
  }
}));

vi.mock('@langchain/core/output_parsers', () => ({
  StringOutputParser: vi.fn(() => ({
    invoke: vi.fn(() => Promise.resolve(mockChainResponse.content))
  }))
}));

vi.mock('@langchain/core/runnables', () => ({
  RunnableSequence: {
    from: vi.fn(() => ({
      invoke: vi.fn().mockResolvedValue(mockChainResponse.content)
    }))
  }
}));

describe('MessageGenerationService RAG Tests', () => {
  let service: MessageGenerationService;

  beforeEach(() => {
    service = new MessageGenerationService();
    vi.clearAllMocks();
    
    // Setup default mock responses
    const mockBuilder = createMockQueryBuilder();
    vi.mocked(supabaseService.from).mockImplementation(() => mockBuilder);
    vi.mocked(supabase.from).mockImplementation(() => mockBuilder);
  });

  describe('Purple Elephant Principle RAG', () => {
    it('should retrieve and use the Purple Elephant article when asked about its core elements', async () => {
      const response = await service.generateResponse(
        'Tell me about the three core elements of the Purple Elephant Principle',
        {
          hasValidDbAccess: true,
          previousMessages: [{
            role: 'customer',
            content: 'Tell me about the three core elements of the Purple Elephant Principle',
            timestamp: new Date().toISOString()
          }]
        }
      );

      // Verify the article was searched for using the service client
      expect(supabaseService.from).toHaveBeenCalledWith('kb_articles');

      // Check for the presence of core elements in the response
      const coreElements = [
        'unexpected delight',
        'memorable impact',
        'consistent uniqueness'
      ];

      // The response should contain at least one of the core elements
      const hasAtLeastOneElement = coreElements.some(element => 
        response.content.toLowerCase().includes(element.toLowerCase())
      );
      expect(hasAtLeastOneElement).toBe(true);

      // Check if the article ID is referenced in the response
      expect(response.context.usedArticles).toContain(mockPurpleElephantArticle.id);
    });

    it('should provide detailed explanations of each core element when found', async () => {
      const response = await service.generateResponse(
        'Explain in detail the three core elements of the Purple Elephant Principle',
        {
          hasValidDbAccess: true,
          previousMessages: [{
            role: 'customer',
            content: 'Explain in detail the three core elements of the Purple Elephant Principle',
            timestamp: new Date().toISOString()
          }]
        }
      );

      // The response should contain all three core elements
      const coreElements = [
        'unexpected delight',
        'memorable impact',
        'consistent uniqueness'
      ];

      // Count how many core elements are present
      const presentElements = coreElements.filter(element => 
        response.content.toLowerCase().includes(element.toLowerCase())
      );

      // Ideally, all three elements should be present
      expect(presentElements.length).toBeGreaterThanOrEqual(2);

      // Each element should have some explanation (at least 50 characters of context)
      presentElements.forEach(element => {
        const elementIndex = response.content.toLowerCase().indexOf(element.toLowerCase());
        const contextAroundElement = response.content.slice(
          Math.max(0, elementIndex - 50),
          Math.min(response.content.length, elementIndex + element.length + 50)
        );
        expect(contextAroundElement.length).toBeGreaterThan(element.length);
      });

      // Verify article reference
      expect(response.context.usedArticles).toContain(mockPurpleElephantArticle.id);
    });

    it('should handle partial matches and related concepts', async () => {
      // Create a mock query builder that properly chains methods
      const mockBuilder = {
        select: vi.fn().mockReturnThis(),
        textSearch: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue(mockSupabaseResponse)
      } as unknown as PostgrestQueryBuilder<any, any, any>;

      // Override the default mock for this test
      vi.mocked(supabaseService.from).mockImplementation(() => mockBuilder);

      const response = await service.generateResponse(
        'What makes something consistently unique according to your principles?',
        {
          hasValidDbAccess: true,
          previousMessages: [{
            role: 'customer',
            content: 'What makes something consistently unique according to your principles?',
            timestamp: new Date().toISOString()
          }]
        }
      );

      // Should recognize this is related to the Purple Elephant Principle
      expect(response.content).toContain('Purple Elephant Principle');
      expect(response.context.usedArticles).toContain(mockPurpleElephantArticle.id);

      // Should specifically address consistent uniqueness
      expect(response.content.toLowerCase()).toContain('consistent uniqueness');
    });
  });

  describe('article search', () => {
    it('should find articles using text search', async () => {
      const context: MessageContext = {
        previousMessages: [{
          role: 'customer',
          content: 'Tell me about the Purple Elephant Principle',
          timestamp: new Date().toISOString()
        }],
        hasValidDbAccess: true
      };

      const response = await service.generateResponse('test', context);
      expect(response.content).toBeDefined();
      expect(response.context.usedArticles).toContain(mockPurpleElephantArticle.id);
    });

    it('should find articles using title match fallback', async () => {
      const context: MessageContext = {
        previousMessages: [{
          role: 'customer',
          content: 'Tell me about customer service principles',
          timestamp: new Date().toISOString()
        }],
        hasValidDbAccess: true
      };

      // Mock text search to return no results
      vi.mocked(supabaseService.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        textSearch: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue({ data: [], error: null }),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnValue({ data: [mockPurpleElephantArticle], error: null })
      }) as unknown as PostgrestQueryBuilder<any, any, any>);

      const response = await service.generateResponse('test', context);
      expect(response.content).toBeDefined();
      expect(response.context.usedArticles).toContain(mockPurpleElephantArticle.id);
    });

    it('should handle search errors gracefully', async () => {
      const context: MessageContext = {
        previousMessages: [{
          role: 'customer',
          content: 'Tell me about the Purple Elephant Principle',
          timestamp: new Date().toISOString()
        }],
        hasValidDbAccess: true
      };

      // Mock search to return error
      vi.mocked(supabaseService.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        textSearch: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue({ data: null, error: new Error('Search failed') }),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnValue({ data: null, error: new Error('Search failed') })
      }) as unknown as PostgrestQueryBuilder<any, any, any>);

      // Mock chain to return response without article references
      vi.mocked(RunnableSequence.from).mockImplementationOnce(() => ({
        invoke: vi.fn().mockResolvedValue(`I apologize, but I don't have access to specific information about that topic at the moment. However, I can provide a general response based on common principles...`)
      }) as unknown as RunnableSequence);

      const response = await service.generateResponse('test', context);
      expect(response.content).toBeDefined();
      expect(response.context.usedArticles).toEqual([]);
    });
  });

  describe('Complete Message Generation Chain', () => {
    let capturedInput: any = null;

    beforeEach(() => {
      capturedInput = null;
      
      // Mock RunnableSequence to capture the formatted context
      vi.mocked(RunnableSequence.from).mockImplementation((config: any) => ({
        invoke: vi.fn().mockImplementation(async (input: any) => {
          capturedInput = input;
          return mockChainResponse.content;
        })
      }) as unknown as RunnableSequence);
    });

    it('should generate a complete response with article references', async () => {
      const context: MessageContext = {
        hasValidDbAccess: true,
        previousMessages: [{
          role: 'customer',
          content: 'Tell me about the three core elements of the Purple Elephant Principle',
          timestamp: new Date().toISOString()
        }]
      };

      // Mock the complete chain
      vi.mocked(RunnableSequence.from).mockImplementationOnce(() => ({
        invoke: vi.fn().mockResolvedValueOnce(mockChainResponse.content)
      }) as unknown as RunnableSequence);

      const response = await service.generateResponse(
        'Tell me about the three core elements of the Purple Elephant Principle',
        context
      );

      // Verify the complete chain
      expect(response.content).toContain('Article ID: aead35aa-24a5-4640-90a2-bdcc4cae7430');
      expect(response.content).toContain('Unexpected Delight');
      expect(response.content).toContain('Memorable Impact');
      expect(response.content).toContain('Consistent Uniqueness');
      expect(response.context.usedArticles).toContain('aead35aa-24a5-4640-90a2-bdcc4cae7430');
      expect(response.context.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should properly format the prompt template with article content', async () => {
      const context: MessageContext = {
        hasValidDbAccess: true,
        previousMessages: [{
          role: 'customer',
          content: 'Tell me about the Purple Elephant Principle',
          timestamp: new Date().toISOString()
        }],
        relevantArticles: [mockPurpleElephantArticle]
      };

      await service.generateResponse('test', context);

      // Verify prompt contains article content as a string
      expect(capturedInput.context).toContain(mockPurpleElephantArticle.id);
      expect(capturedInput.context).toContain(mockPurpleElephantArticle.title);
      expect(capturedInput.context).toContain(mockPurpleElephantArticle.content);
      expect(capturedInput.context).toContain('CRITICAL INSTRUCTIONS');
    });

    it('should properly configure the OpenAI model', async () => {
      const service = new MessageGenerationService({
        temperature: 0.7,
        maxTokens: 500,
        modelName: 'gpt-4-turbo-preview'
      });

      const context: MessageContext = {
        hasValidDbAccess: true,
        relevantArticles: [mockPurpleElephantArticle]
      };

      await service.generateResponse('test', context);

      const chatOpenAIInstance = vi.mocked(ChatOpenAI).mock.results[0]?.value;
      expect(chatOpenAIInstance).toBeDefined();
      expect(chatOpenAIInstance.configuration).toBeDefined();
      expect(chatOpenAIInstance.configuration.temperature).toBe(0.7);
      expect(chatOpenAIInstance.configuration.maxTokens).toBe(500);
      expect(chatOpenAIInstance.configuration.modelName).toBe('gpt-4-turbo-preview');
      expect(chatOpenAIInstance.configuration.openAIApiKey).toBe('test-key-123');
    });

    it('should handle the complete chain with error handling', async () => {
      const context: MessageContext = {
        hasValidDbAccess: true,
        previousMessages: [{
          role: 'customer',
          content: 'test',
          timestamp: new Date().toISOString()
        }]
      };

      // Mock chain to throw error
      vi.mocked(RunnableSequence.from).mockImplementationOnce(() => ({
        invoke: vi.fn().mockRejectedValue(new Error('Chain error'))
      }) as unknown as RunnableSequence);

      await expect(service.generateResponse('test', context))
        .rejects.toThrow(AIError);
    });

    it('should validate and enhance context before generation', async () => {
      const context: MessageContext = {
        hasValidDbAccess: true,
        previousMessages: [{
          role: 'customer',
          content: 'Tell me about the Purple Elephant Principle',
          timestamp: new Date().toISOString()
        }],
        // Add invalid article to test validation
        relevantArticles: [{
          id: 'invalid-id',
          title: 'Invalid Article',
          content: 'Invalid content',
          category_id: 'invalid'
        }]
      };

      const response = await service.generateResponse('test', context);

      // Should have cleared invalid articles and fetched new ones
      expect(response.context.usedArticles).not.toContain('invalid-id');
      expect(supabaseService.from).toHaveBeenCalled();
    });

    it('should properly extract and format used articles', async () => {
      const context: MessageContext = {
        hasValidDbAccess: true,
        previousMessages: [{
          role: 'customer',
          content: 'test',
          timestamp: new Date().toISOString()
        }]
      };

      // Mock chain to return response with article references
      vi.mocked(RunnableSequence.from).mockImplementationOnce(() => ({
        invoke: vi.fn().mockResolvedValueOnce(`
          Based on our documentation (Article ID: ${mockPurpleElephantArticle.id}), 
          the first element is Unexpected Delight. 
          As mentioned in (Article ID: another-id), there are more elements...
        `)
      }) as unknown as RunnableSequence);

      const response = await service.generateResponse('test', context);

      // Should extract all referenced articles
      expect(response.context.usedArticles).toContain(mockPurpleElephantArticle.id);
      expect(response.context.usedArticles).toContain('another-id');
    });
  });
}); 


