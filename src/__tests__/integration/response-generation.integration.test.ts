/**
 * @fileoverview Integration tests for MessageGenerationService response generation
 * Tests message generation functionality and response quality
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MessageGenerationService, type MessageContext } from '../../services/message-generation.service';
import { supabase, supabaseService } from '../../lib/supabase';

// Generate a unique email for this test run
const timestamp = new Date().getTime();
const testUser = {
  email: `test-response-integration-${timestamp}@example.com`,
  password: 'test123!',
  full_name: 'Test Response User',
  role: 'admin'
};

// Test article data
const testArticle = {
  title: 'Customer Service Best Practices',
  content: `This article covers essential customer service best practices.
  
  1. Empathy and Understanding
  Always show empathy towards customer concerns. Put yourself in their shoes and understand their perspective.
  
  2. Clear Communication
  Communicate clearly and effectively. Use simple language and avoid technical jargon unless necessary.
  
  3. Timely Responses
  Respond to customer inquiries promptly. Set clear expectations about response times.
  
  4. Solution-Oriented Approach
  Focus on finding solutions rather than dwelling on problems. Be proactive in addressing customer needs.`,
  category_id: '258ab2fa-c668-484d-a2e1-816a861f1336',
  status: 'published',
  author_id: '' // Will be set after user creation
};

describe('MessageGenerationService Response Generation Tests', () => {
  let service: MessageGenerationService;
  let testArticleId: string;
  let testUserId: string;

  // Set up test data before running tests
  beforeAll(async () => {
    console.log('🔄 Starting response generation test setup...');
    
    // Initialize service
    service = new MessageGenerationService({
      temperature: 0.7,
      maxTokens: 500,
      modelName: 'gpt-4-turbo-preview'
    });
    console.log('✅ Service initialized');

    try {
      // Create test user through auth
      console.log('🔄 Creating test user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            full_name: testUser.full_name,
            role: testUser.role
          }
        }
      });

      if (authError) {
        throw new Error(`Failed to create test user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user data returned from auth signup');
      }

      testUserId = authData.user.id;
      console.log('✅ Test user created with ID:', testUserId);

      // Wait for user creation to propagate
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Set author_id for test article
      testArticle.author_id = testUserId;

      // Insert test article
      console.log('🔄 Creating test article...');
      const { data: articleData, error: articleError } = await supabaseService
        .from('kb_articles')
        .insert(testArticle)
        .select()
        .single();

      if (articleError) {
        throw new Error(`Failed to insert test article: ${articleError.message}`);
      }

      if (!articleData) {
        throw new Error('No data returned from article insertion');
      }

      testArticleId = articleData.id;
      console.log('✅ Test article created with ID:', testArticleId);

      // Wait for search indexing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('❌ Failed to set up test data:', error);
      // Clean up any partially created data
      if (testUserId) {
        try {
          console.log('🔄 Cleaning up test user after setup failure...');
          await supabaseService.auth.admin.deleteUser(testUserId);
          console.log('✅ Cleaned up test user after setup failure');
        } catch (cleanupError) {
          console.error('❌ Failed to clean up test user:', cleanupError);
        }
      }
      if (testArticleId) {
        try {
          console.log('🔄 Cleaning up test article after setup failure...');
          await supabaseService
            .from('kb_articles')
            .delete()
            .eq('id', testArticleId);
          console.log('✅ Cleaned up test article after setup failure');
        } catch (cleanupError) {
          console.error('❌ Failed to clean up test article:', cleanupError);
        }
      }
      throw error;
    }
  }, 30000);

  // Clean up test data after tests
  afterAll(async () => {
    if (testArticleId) {
      try {
        // Delete test article
        const { error: articleError } = await supabaseService
          .from('kb_articles')
          .delete()
          .eq('id', testArticleId);

        if (articleError) {
          console.error('Failed to delete test article:', articleError);
        } else {
          console.log('✅ Test article deleted');
        }
      } catch (error) {
        console.error('Failed to delete test article:', error);
      }
    }

    if (testUserId) {
      try {
        // Delete test user through auth
        const { error: userError } = await supabaseService.auth.admin.deleteUser(testUserId);

        if (userError) {
          console.error('Failed to delete test user:', userError);
        } else {
          console.log('✅ Test user deleted');
        }
      } catch (error) {
        console.error('Failed to delete test user:', error);
      }
    }
  }, 30000);

  describe('Response Generation Tests', () => {
    it('should generate responses incorporating knowledge base content', async () => {
      const context: MessageContext = {
        previousMessages: [{
          role: 'customer',
          content: 'What are the best practices for customer service?',
          timestamp: new Date().toISOString()
        }],
        hasValidDbAccess: true,
        testArticleId: testArticleId
      };

      const response = await service.generateResponse('customer service best practices', context);
      
      expect(response.content).toBeDefined();
      expect(response.context.usedArticles).toEqual(expect.arrayContaining([testArticleId]));
      expect(response.content.toLowerCase()).toMatch(/empathy|understanding|clear communication|timely/i);
    }, 30000);

    it('should maintain consistent tone across responses', async () => {
      const context: MessageContext = {
        previousMessages: [{
          role: 'customer',
          content: 'How can I improve my communication with customers?',
          timestamp: new Date().toISOString()
        }],
        hasValidDbAccess: true,
        testArticleId: testArticleId
      };

      const response = await service.generateResponse('customer communication', context);
      
      expect(response.content).toBeDefined();
      expect(response.context.tone).toBeDefined();
      expect(response.content).toMatch(/professional|clear|effective/i);
    }, 30000);

    it('should generate contextually relevant responses based on conversation history', async () => {
      const context: MessageContext = {
        previousMessages: [
          {
            role: 'customer',
            content: 'I need help with customer service',
            timestamp: new Date().toISOString()
          },
          {
            role: 'agent',
            content: 'I can help you with customer service best practices. What specific aspect would you like to know about?',
            timestamp: new Date().toISOString()
          },
          {
            role: 'customer',
            content: 'How can I handle difficult customers better?',
            timestamp: new Date().toISOString()
          }
        ],
        hasValidDbAccess: true
      };

      const response = await service.generateResponse('handling difficult customers', context);
      
      expect(response.content).toBeDefined();
      expect(response.content).toMatch(/empathy|understanding|patience/i);
      expect(response.context.confidence).toBeGreaterThan(0.7);
    }, 60000);

    it('should handle empty or minimal context gracefully', async () => {
      const context: MessageContext = {
        previousMessages: [],
        hasValidDbAccess: true
      };

      const response = await service.generateResponse('customer service', context);
      
      expect(response.content).toBeDefined();
      expect(response.content).toMatch(/help|assist|support/i);
      expect(response.context.confidence).toBeDefined();
    }, 30000);

    it('should provide appropriate responses when no relevant articles are found', async () => {
      const context: MessageContext = {
        previousMessages: [{
          role: 'customer',
          content: 'Tell me about quantum physics',
          timestamp: new Date().toISOString()
        }],
        hasValidDbAccess: true,
        skipTestArticles: true
      };

      const response = await service.generateResponse('quantum physics', context);
      
      expect(response.content).toBeDefined();
      expect(response.context.usedArticles).toEqual([]);
      expect(response.content).toMatch(/cannot find|no specific information|limited information/i);
    }, 30000);

    it('should handle rate limiting and errors gracefully', async () => {
      // Create a context that might trigger rate limiting
      const context: MessageContext = {
        previousMessages: Array(10).fill({
          role: 'customer',
          content: 'Test message',
          timestamp: new Date().toISOString()
        }),
        hasValidDbAccess: true
      };

      const response = await service.generateResponse('test', context);
      
      expect(response.content).toBeDefined();
      expect(response.context.confidence).toBeDefined();
      expect(response.content).not.toMatch(/error|exception|failed/i);
    }, 30000);
  });
}); 
