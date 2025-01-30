/**
 * @fileoverview Integration tests for AI services
 * @module services/__tests__/integration/ai-services
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { AIService } from '../../ai.service';
import { MessageGenerationService, type MessageContext } from '../../message-generation.service';
import { FeedbackService, FeedbackRating, FeedbackCategory } from '../../feedback.service';
import { supabase } from '../../../lib/supabase';
import { AIError } from '../../ai.service';
import { v4 as uuidv4 } from 'uuid';

describe('AI Services Integration', () => {
  let aiService: AIService;
  let messageService: MessageGenerationService;
  let feedbackService: FeedbackService;
  let testUserId: string;
  let testTicketId: string;
  let testArticleId: string;
  let testCategoryId: string;

  // Store original environment variables
  const originalEnv = { ...process.env };

  beforeAll(async () => {
    // Use the real OpenAI API key from environment
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for tests');
    }
    if (!process.env.TAVILY_API_KEY) {
      throw new Error('TAVILY_API_KEY environment variable is required for tests');
    }

    // Create test user
    const { data: { user }, error: userError } = await supabase.auth.signUp({
      email: `test_${Date.now()}@example.com`,
      password: 'testpassword123'
    });
    if (userError) throw userError;
    testUserId = user!.id;

    // Create test ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        title: 'Test Ticket',
        description: 'Test Description',
        status: 'open',
        priority: 'medium',
        created_by: testUserId,
        metadata: {
          source: 'test'
        }
      })
      .select()
      .single();
    if (ticketError) throw ticketError;
    testTicketId = ticket.id;

    // Create test category
    const { data: category, error: categoryError } = await supabase
      .from('kb_categories')
      .insert({
        name: 'Test Category',
        description: 'Test Description'
      })
      .select()
      .single();
    if (categoryError) throw categoryError;
    testCategoryId = category.id;

    // Create test knowledge base article
    const { data: article, error: articleError } = await supabase
      .from('kb_articles')
      .insert({
        title: 'Password Reset Guide',
        content: 'Here are the steps to reset your password...',
        category_id: testCategoryId,
        author_id: testUserId,
        status: 'published',
        metadata: {
          keywords: ['password', 'reset', 'account']
        }
      })
      .select()
      .single();
    if (articleError) {
      console.error('Error creating test article:', articleError);
      throw articleError;
    }
    console.log('Created test article:', article);
    testArticleId = article.id;
  });

  afterAll(async () => {
    // Clean up test data in reverse order of creation
    await supabase.from('ai_feedback').delete().eq('ticket_id', testTicketId);
    await supabase.from('kb_articles').delete().eq('id', testArticleId);
    await supabase.from('kb_categories').delete().eq('id', testCategoryId);
    await supabase.from('tickets').delete().eq('id', testTicketId);
    await supabase.auth.admin.deleteUser(testUserId);
    
    // Restore original environment variables
    process.env = { ...originalEnv };
  });

  beforeEach(async () => {
    // Initialize services
    aiService = new AIService();
    messageService = new MessageGenerationService();
    feedbackService = new FeedbackService();
  });

  afterEach(async () => {
    // Clean up test feedback after each test
    await supabase.from('ai_feedback').delete().eq('ticket_id', testTicketId);
  });

  describe('Full Message Generation Flow', () => {
    it('should generate a response and store feedback', async () => {
      // Create a unique test identifier
      const testMessageId = `test-${Date.now()}`;
      
      // Verify no existing feedback
      const initialFeedback = await feedbackService.getFeedback(testMessageId);
      expect(initialFeedback).toHaveLength(0);
      
      // 1. Set up test context
      const context: MessageContext = {
        ticketId: testTicketId,
        customerId: testUserId,
        hasValidDbAccess: true,
        previousMessages: [
          {
            role: 'customer',
            content: 'How do I reset my password?',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      // 2. Generate response
      const response = await messageService.generateResponse(
        'How do I reset my password?',
        context
      );

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(response.context.confidence).toBeGreaterThan(0);
      expect(Array.isArray(response.context.usedArticles)).toBe(true);
      expect(response.context.usedArticles).toContain(testArticleId);

      // 3. Submit feedback
      const feedback = await feedbackService.submitFeedback({
        messageId: testMessageId,
        rating: FeedbackRating.GOOD,
        category: FeedbackCategory.ACCURACY,
        comment: 'Very helpful response',
        ticketId: testTicketId,
        userId: testUserId,
      });

      expect(feedback).toBeDefined();
      expect(feedback.rating).toBe(FeedbackRating.GOOD);
      expect(feedback.category).toBe(FeedbackCategory.ACCURACY);

      // 4. Retrieve feedback
      const storedFeedback = await feedbackService.getFeedback(testMessageId);
      expect(storedFeedback).toHaveLength(1);
      expect(storedFeedback[0].rating).toBe(FeedbackRating.GOOD);

      // Clean up test feedback
      await supabase
        .from('ai_feedback')
        .delete()
        .eq('message_id', testMessageId);
    }, { timeout: 30000 }); // 30 second timeout

    it('should handle context enhancement correctly', async () => {
      // 1. Set up test context
      const context: MessageContext = {
        ticketId: testTicketId,
        customerId: testUserId,
        hasValidDbAccess: true,
        previousMessages: [
          {
            role: 'customer',
            content: 'How do I reset my password?',
            timestamp: new Date().toISOString(),
          },
        ],
        // Pre-populate relevant articles to ensure we use the test article
        relevantArticles: [{
          id: testArticleId,
          title: 'Password Reset Guide',
          content: 'Here are the steps to reset your password...',
          category_id: testCategoryId
        }]
      };

      // 2. Generate response with context
      const enhancedMessageService = new MessageGenerationService({
        includeKnowledgeBase: true,
        includeTicketHistory: true
      });

      const response = await enhancedMessageService.generateResponse(
        'How do I reset my password?',
        context
      );

      // 3. Verify context enhancement
      expect(response.context.usedArticles).toContain(testArticleId);
      expect(response.content).toContain('password');
      expect(response.context.confidence).toBeGreaterThan(0.5);
    }, { timeout: 30000 }); // 30 second timeout

    it('should handle feedback metrics correctly', async () => {
      // 1. Create unique test message IDs
      const testMessageIds = [
        `test-metrics-1-${Date.now()}`,
        `test-metrics-2-${Date.now()}`
      ];
      
      // 2. Submit test feedback entries
      const feedbackData = [
        {
          messageId: testMessageIds[0],
          rating: FeedbackRating.GOOD,
          category: FeedbackCategory.ACCURACY,
          comment: 'Very helpful response',
          ticketId: testTicketId,
          userId: testUserId,
        },
        {
          messageId: testMessageIds[1],
          rating: FeedbackRating.POOR,
          category: FeedbackCategory.RELEVANCE,
          comment: 'Not relevant to my question',
          ticketId: testTicketId,
          userId: testUserId,
        },
      ];

      for (const feedback of feedbackData) {
        await feedbackService.submitFeedback(feedback);
      }

      // 3. Get feedback metrics
      const metrics = await feedbackService.getFeedbackMetrics({
        messageIds: testMessageIds,
      });

      // 4. Verify metrics
      expect(metrics.totalFeedback).toBe(2);
      expect(metrics.averageRating).toBe(2);
      expect(metrics.categoryBreakdown).toEqual({
        [FeedbackCategory.ACCURACY]: 1,
        [FeedbackCategory.RELEVANCE]: 1,
        [FeedbackCategory.TONE]: 0,
        [FeedbackCategory.CLARITY]: 0,
        [FeedbackCategory.COMPLETENESS]: 0,
      });

      // Clean up test feedback
      await supabase
        .from('ai_feedback')
        .delete()
        .in('message_id', testMessageIds);
    });

    it('should handle empty or invalid context gracefully', async () => {
      // Test with empty context
      const emptyContext: MessageContext = {
        ticketId: testTicketId,
        customerId: testUserId,
        hasValidDbAccess: true,
        previousMessages: []
      };

      const response = await messageService.generateResponse(
        'How do I reset my password?',
        emptyContext
      );

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(response.context.confidence).toBeGreaterThan(0);
      expect(Array.isArray(response.context.usedArticles)).toBe(true);

      // Test with minimal context
      const minimalContext: MessageContext = {
        ticketId: testTicketId,
        customerId: testUserId,
        hasValidDbAccess: true,
        previousMessages: [
          {
            role: 'customer',
            content: '',
            timestamp: new Date().toISOString(),
          }
        ]
      };

      const minimalResponse = await messageService.generateResponse(
        'How do I reset my password?',
        minimalContext
      );

      expect(minimalResponse).toBeDefined();
      expect(minimalResponse.content).toBeTruthy();
      expect(minimalResponse.context.confidence).toBeGreaterThan(0);
    }, { timeout: 30000 });

    it('should handle multiple relevant articles correctly', async () => {
      // Create additional test articles
      const additionalArticles = await Promise.all([
        supabase
          .from('kb_articles')
          .insert({
            title: 'Advanced Password Reset Guide',
            content: 'Advanced steps for password reset...',
            category_id: testCategoryId,
            author_id: testUserId,
            status: 'published',
            metadata: {
              keywords: ['password', 'reset', 'advanced']
            }
          })
          .select()
          .single(),
        supabase
          .from('kb_articles')
          .insert({
            title: 'Password Security Best Practices',
            content: 'Best practices for password security...',
            category_id: testCategoryId,
            author_id: testUserId,
            status: 'published',
            metadata: {
              keywords: ['password', 'security', 'best practices']
            }
          })
          .select()
          .single()
      ]);

      const articleIds = additionalArticles.map(result => result.data?.id);

      // Set up context with multiple articles
      const context: MessageContext = {
        ticketId: testTicketId,
        customerId: testUserId,
        hasValidDbAccess: true,
        previousMessages: [
          {
            role: 'customer',
            content: 'How do I reset my password and keep it secure?',
            timestamp: new Date().toISOString(),
          }
        ],
        relevantArticles: [
          {
            id: testArticleId,
            title: 'Password Reset Guide',
            content: 'Here are the steps to reset your password...',
            category_id: testCategoryId
          },
          ...additionalArticles.map(result => ({
            id: result.data?.id,
            title: result.data?.title,
            content: result.data?.content,
            category_id: testCategoryId
          }))
        ].filter(article => article.id) // Filter out any undefined articles
      };

      const response = await messageService.generateResponse(
        'How do I reset my password and keep it secure?',
        context
      );

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(response.context.confidence).toBeGreaterThan(0);
      expect(Array.isArray(response.context.usedArticles)).toBe(true);
      expect(response.context.usedArticles.length).toBeGreaterThan(1);
      expect(response.context.usedArticles).toContain(testArticleId);
      
      // Clean up additional test articles
      for (const articleId of articleIds) {
        if (articleId) {
          await supabase.from('kb_articles').delete().eq('id', articleId);
        }
      }
    }, { timeout: 30000 });

    it('should maintain consistent article references across multiple responses', async () => {
      const context: MessageContext = {
        ticketId: testTicketId,
        customerId: testUserId,
        hasValidDbAccess: true,
        previousMessages: [
          {
            role: 'customer',
            content: 'How do I reset my password?',
            timestamp: new Date().toISOString(),
          }
        ],
        relevantArticles: [{
          id: testArticleId,
          title: 'Password Reset Guide',
          content: 'Here are the steps to reset your password...',
          category_id: testCategoryId
        }]
      };

      // Generate multiple responses
      const responses = await Promise.all([
        messageService.generateResponse('How do I reset my password?', context),
        messageService.generateResponse('Can you help with password reset?', context),
        messageService.generateResponse('I need to change my password', context)
      ]);

      // Verify consistency
      responses.forEach(response => {
        expect(response.context.usedArticles).toContain(testArticleId);
        expect(response.context.confidence).toBeGreaterThan(0.5);
      });

      // Verify similar confidence scores
      const confidences = responses.map(r => r.context.confidence);
      const maxDiff = Math.max(...confidences) - Math.min(...confidences);
      expect(maxDiff).toBeLessThan(0.3); // Confidence scores should be relatively consistent
    }, { timeout: 45000 });
  });

  describe('Error Handling', () => {
    it('should handle invalid API key gracefully', async () => {
      // Temporarily set invalid API key
      process.env.OPENAI_API_KEY = 'invalid_key';
      
      const errorService = new MessageGenerationService();
      const context: MessageContext = {
        ticketId: testTicketId,
        customerId: testUserId,
        hasValidDbAccess: true,
        previousMessages: [
          {
            role: 'customer',
            content: 'How do I reset my password?',
            timestamp: new Date().toISOString(),
          }
        ]
      };

      await expect(
        errorService.generateResponse('How do I reset my password?', context)
      ).rejects.toThrow(AIError);

      // Restore valid API key
      process.env.OPENAI_API_KEY = originalEnv.OPENAI_API_KEY;
    });

    it('should handle database errors gracefully', async () => {
      // Create a service with invalid database credentials
      const invalidDbConfig = {
        supabaseUrl: 'https://invalid-url.supabase.co',
        supabaseKey: 'invalid_key'
      };
      
      const errorService = new MessageGenerationService();
      const context: MessageContext = {
        ticketId: 'invalid-ticket-id',
        customerId: 'invalid-user-id',
        hasValidDbAccess: false,
        previousMessages: [
          {
            role: 'customer',
            content: 'How do I reset my password?',
            timestamp: new Date().toISOString(),
          }
        ],
        // Force immediate failure by providing invalid articles
        relevantArticles: [{
          id: 'non-existent-id',
          title: 'Non-existent Article',
          content: 'This article does not exist...',
          category_id: 'invalid-category'
        }]
      };

      const response = await errorService.generateResponse(
        'How do I reset my password?',
        context
      );

      // Should still generate a response even with DB errors
      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(response.context.confidence).toBeGreaterThan(0);
      // Should have empty usedArticles since DB access failed
      expect(response.context.usedArticles).toEqual([]);
    }, { timeout: 30000 }); // Increase timeout to 30 seconds
  });
}); 