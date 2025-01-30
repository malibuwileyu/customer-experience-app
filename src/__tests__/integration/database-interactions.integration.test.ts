/**
 * @fileoverview Integration tests for MessageGenerationService database interactions
 * Tests database search functionality and error handling
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MessageGenerationService, type MessageContext } from '../../services/message-generation.service';
import { supabase, supabaseService } from '../../lib/supabase';

// Generate a unique email for this test run
const timestamp = new Date().getTime();
const testUser = {
  email: `test-db-integration-${timestamp}@example.com`,
  password: 'test123!',
  full_name: 'Test DB User',
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

describe('MessageGenerationService Database Integration Tests', () => {
  let service: MessageGenerationService;
  let testArticleId: string;
  let testUserId: string;

  // Set up test data before running tests
  beforeAll(async () => {
    console.log('🔄 Starting database test setup...');
    
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
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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

  describe('Database Search Tests', () => {
    it('should find articles using text search with exact matches', async () => {
      const context: MessageContext = {
        previousMessages: [{
          role: 'customer',
          content: 'Tell me about customer service principles',
          timestamp: new Date().toISOString()
        }],
        hasValidDbAccess: true
      };

      const response = await service.generateResponse('customer service principles', context);
      
      expect(response.content).toBeDefined();
      expect(response.content.toLowerCase()).toMatch(/empathy|understanding|clear communication|timely/i);
      expect(response.context.usedArticles.length).toBeGreaterThan(0);
    }, 30000);

    it('should find articles using partial keyword matches', async () => {
      const context: MessageContext = {
        previousMessages: [{
          role: 'customer',
          content: 'What are the principles of being responsive?',
          timestamp: new Date().toISOString()
        }],
        hasValidDbAccess: true
      };

      const response = await service.generateResponse('responsive', context);
      
      expect(response.content).toBeDefined();
      expect(response.content.toLowerCase()).toMatch(/timely|response|promptly/i);
      expect(response.context.usedArticles.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle multiple search terms effectively', async () => {
      const context: MessageContext = {
        previousMessages: [{
          role: 'customer',
          content: 'How can I show empathy and provide clear solutions?',
          timestamp: new Date().toISOString()
        }],
        hasValidDbAccess: true
      };

      const response = await service.generateResponse('empathy clear solutions', context);
      
      expect(response.content).toBeDefined();
      expect(response.content.toLowerCase()).toMatch(/empathy|solution|clear/i);
      expect(response.context.usedArticles.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle search with no matching articles gracefully', async () => {
      const context: MessageContext = {
        previousMessages: [{
          role: 'customer',
          content: 'Tell me about something completely unrelated xyz123',
          timestamp: new Date().toISOString()
        }],
        hasValidDbAccess: true,
        forceEmptyResults: true // Force empty results for this test
      };

      const response = await service.generateResponse('xyz123', context);
      
      expect(response.content).toBeDefined();
      expect(response.content.toLowerCase()).toMatch(/experiencing|limitations|technical|difficulties|apologize/i);
      expect(response.context.usedArticles).toEqual([]);
    }, 30000);
  });

  describe('Database Access Tests', () => {
    it('should handle database access errors gracefully', async () => {
      const context: MessageContext = {
        previousMessages: [{
          role: 'customer',
          content: 'Tell me about customer service',
          timestamp: new Date().toISOString()
        }],
        hasValidDbAccess: false,
        forceEmptyResults: true // Force empty results for this test
      };

      const response = await service.generateResponse('customer service', context);
      
      expect(response.content).toBeDefined();
      expect(response.content.toLowerCase()).toMatch(/cannot access|unable to access|apologize|no access|database|technical/i);
      expect(response.context.usedArticles).toEqual([]);
    }, 30000);
  });
}); 
