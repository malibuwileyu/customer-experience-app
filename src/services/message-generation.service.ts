/**
 * @fileoverview Message Generation Service for OutreachGPT
 * @module services/message-generation
 * @description
 * Handles the generation of AI-powered responses using LangChain,
 * including context gathering and prompt engineering.
 */

import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, type Runnable } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { AIService, AIConfig, AIError, AIErrorType } from './ai.service';
import { supabase, supabaseService } from '../lib/supabase';

/**
 * Message generation configuration
 */
export interface MessageConfig extends AIConfig {
  maxContextLength?: number;
  includeKnowledgeBase?: boolean;
  includeTicketHistory?: boolean;
  tonePreference?: 'formal' | 'casual' | 'friendly' | 'professional';
}

/**
 * Message context data structure
 */
export interface MessageContext {
  ticketId?: string;
  customerId?: string;
  previousMessages?: Array<{
    role: 'customer' | 'agent';
    content: string;
    timestamp: string;
  }>;
  relevantArticles?: Array<{
    id: string;
    title: string;
    content: string;
    category_id: string;
  }>;
  hasValidDbAccess: boolean;
  forceEmptyResults?: boolean;
  skipTestArticles?: boolean;
  testArticleId?: string;
}

/**
 * Generated message response
 */
export interface GeneratedMessage {
  content: string;
  context: {
    usedArticles: string[];
    confidence: number;
    tone: string;
  };
}

/**
 * Default configuration for message generation
 */
const DEFAULT_MESSAGE_CONFIG: MessageConfig = {
  temperature: 0.7,
  maxTokens: 500,
  modelName: 'gpt-4-turbo-preview',
  streaming: false,
  maxContextLength: 4000,
  includeKnowledgeBase: true,
  includeTicketHistory: true,
  tonePreference: 'professional',
};

/**
 * Service for generating AI-powered messages
 */
export class MessageGenerationService extends AIService {
  protected messageConfig: MessageConfig;

  constructor(config: Partial<MessageConfig> = {}) {
    super(config);
    this.messageConfig = { ...DEFAULT_MESSAGE_CONFIG, ...config };
  }

  /**
   * Generates a response based on the given prompt and context
   * @param prompt User's message or query
   * @param context Additional context for message generation
   * @returns Generated message with metadata
   */
  public async generateResponse(
    prompt: string,
    context: MessageContext
  ): Promise<GeneratedMessage> {
    console.log('🔄 Starting message generation for prompt:', prompt);
    
    // Initialize enhanced context
    let enhancedContext = { ...context };
    
    // Initialize context with database access
    console.log('🔄 Initializing context with database access');
    
    // Test database access if needed
    if (!enhancedContext.relevantArticles?.length) {
      console.log('🔄 Testing database access...');
      try {
        const testQuery = await supabaseService.from('kb_articles').select('count').limit(1);
        if (testQuery.error) {
          console.error('❌ Database access test failed:', testQuery.error);
          enhancedContext.hasValidDbAccess = false;
        } else {
          console.log('✅ Database access test successful');
        }
      } catch (error) {
        console.error('❌ Database access test failed with error:', error);
        enhancedContext.hasValidDbAccess = false;
      }
    }

    // Only gather context if we have valid database access and not forcing empty results
    if (!enhancedContext.relevantArticles?.length && enhancedContext.hasValidDbAccess && !enhancedContext.forceEmptyResults) {
      console.log('🔄 Gathering additional context...');
      enhancedContext = await this.gatherContext(enhancedContext);
      console.log('✅ Context gathered:', {
        articlesFound: enhancedContext.relevantArticles?.length || 0,
        hasMessages: !!enhancedContext.previousMessages?.length
      });
    }

    // If forcing empty results, clear any existing articles
    if (enhancedContext.forceEmptyResults) {
      enhancedContext.relevantArticles = [];
      enhancedContext.hasValidDbAccess = false;
    }

    // Create the generation chain
    console.log('🔄 Creating message chain...');
    const chain = await this.createMessageChain(enhancedContext);
    console.log('✅ Message chain created');
    
    // Generate the response
    console.log('🔄 Invoking chain with prompt and context...');
    let response: string;
    try {
      response = await chain.invoke({
        prompt,
        tone: this.messageConfig.tonePreference,
        context: this.formatContextForPrompt(enhancedContext),
      });
      console.log('✅ Chain response received');
    } catch (error) {
      console.error('❌ Error invoking chain:', error);
      throw new AIError(
        AIErrorType.CHAIN_ERROR,
        'Failed to generate response',
        error
      );
    }

    // Extract used articles and analyze response
    console.log('🔄 Processing response...');
    const usedArticles = enhancedContext.forceEmptyResults ? [] : this.extractUsedArticles(response);
    
    const confidence = this.calculateConfidence(response);
    
    console.log('✅ Response processing complete:', {
      usedArticles: usedArticles.length,
      confidence,
      responseLength: response.length
    });
    
    return {
      content: response,
      context: {
        usedArticles,
        confidence,
        tone: this.messageConfig.tonePreference || 'professional',
      },
    };
  }

  /**
   * Gathers and enhances context for message generation
   * @param context Base context for the message
   * @returns Enhanced context with additional relevant information
   */
  private async gatherContext(context: MessageContext): Promise<MessageContext> {
    const enhancedContext = { ...context };

    if (this.messageConfig.includeKnowledgeBase) {
      enhancedContext.relevantArticles = await this.fetchRelevantArticles(context);
      
      // Format articles for better LLM understanding
      if (enhancedContext.relevantArticles?.length) {
        const formattedArticles = enhancedContext.relevantArticles.map(article => ({
          id: article.id,
          title: article.title,
          content: article.content,
          category_id: article.category_id,
          summary: `${article.title}: ${article.content.substring(0, 200)}...`,
          instructions: `IMPORTANT: You MUST reference this article as (Article ID: ${article.id}) when using its information.`,
          note: `This article MUST be referenced as (Article ID: ${article.id}) in your response.`
        }));
        enhancedContext.relevantArticles = formattedArticles;
      }
    }

    if (this.messageConfig.includeTicketHistory && context.ticketId) {
      enhancedContext.previousMessages = await this.fetchTicketHistory(context.ticketId);
    }

    // Format the context for better LLM understanding
    const formattedContext = {
      ...enhancedContext,
      relevantArticles: enhancedContext.relevantArticles?.map(article => ({
        ...article,
        reminder: `CRITICAL: You MUST reference this article as (Article ID: ${article.id}) in your response.`
      }))
    };

    return formattedContext;
  }

  /**
   * Creates the message generation chain with proper prompting
   * @param context Enhanced context for message generation
   * @returns Configured chain for message generation
   */
  private async createMessageChain(context: MessageContext): Promise<Runnable> {
    console.log('🔄 Creating message chain with context:', {
      hasArticles: !!context.relevantArticles?.length,
      hasMessages: !!context.previousMessages?.length,
      hasValidDbAccess: context.hasValidDbAccess
    });

    let template = '';

    if (!context.hasValidDbAccess) {
      template = `You are a helpful customer service AI assistant.
      
      I apologize, but I am currently unable to access our knowledge base due to technical issues. 
      I will do my best to assist you with general guidance, but I cannot provide specific information from our documentation at this time.
      
      Customer's question: {prompt}
      
      Please provide a {tone} response that:
      1. Acknowledges the database access limitation
      2. Apologizes for the technical difficulty
      3. Offers to help with general guidance
      4. Suggests alternative options if available`;
    } else if (!context.relevantArticles?.length) {
      template = `You are a helpful customer service AI assistant.
      
      I regret to inform you that I cannot find any specific information in our knowledge base related to your query.
      
      Customer's question: {prompt}
      
      Please provide a {tone} response that:
      1. Starts with "I regret to inform you that I cannot find any specific information in our knowledge base related to your query."
      2. Shows empathy and understanding for the customer's needs
      3. Explains that you can only provide general guidance at this time
      4. Offers to help with alternative suggestions or clarification`;
    } else {
      template = `You are a helpful customer service AI assistant.
      
      Use the following context to help answer the customer's question:
      ${context.relevantArticles?.map(article => {
        console.log('📝 Including article in template:', article.id);
        return `Article ID: ${article.id}
        Title: ${article.title}
        Content: ${article.content}
        
        IMPORTANT: You MUST reference this article as (Article ID: ${article.id}) when using its information.
        NOTE: Include the exact Article ID format when referencing this article.
        `;
      }).join('\n\n') || 'No relevant articles found.'}
      
      CRITICAL INSTRUCTIONS FOR USING KNOWLEDGE BASE ARTICLES:
      1. You MUST use any relevant knowledge base articles from the context to inform your response
      2. You MUST reference ALL used articles by including their IDs in your response using this format: (Article ID: <id>)
      3. You MUST reference articles at the point where you use their information
      4. You MUST include at least one article reference if relevant articles are provided
      5. You MUST NOT modify or abbreviate the article IDs - use them exactly as provided
      6. You MUST use the exact format "Article ID: <id>" when referencing articles

      RESPONSE STYLE INSTRUCTIONS:
      1. Show empathy and understanding for the customer's needs
      2. Use clear, simple language that demonstrates patience
      3. Provide specific examples when possible
      4. Break down complex concepts into digestible parts
      5. Maintain a helpful and supportive tone throughout

      Customer's question: {prompt}

      Please provide a {tone} response that thoroughly answers the question while showing empathy and understanding.`;
    }

    console.log('✅ Template created with instructions');

    const prompt = PromptTemplate.fromTemplate(template);
    console.log('✅ Prompt template created');

    const model = new ChatOpenAI({
      temperature: this.messageConfig.temperature,
      maxTokens: this.messageConfig.maxTokens,
      modelName: this.messageConfig.modelName,
      openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY
    });
    console.log('✅ ChatOpenAI model configured:', this.messageConfig.modelName);

    try {
      const chain = RunnableSequence.from([
        prompt,
        model,
        new StringOutputParser(),
      ]);
      console.log('✅ Chain sequence created');
      return chain;
    } catch (error) {
      console.error('❌ Error creating message chain:', error);
      throw new AIError(
        AIErrorType.CHAIN_ERROR,
        'Failed to create message chain',
        error
      );
    }
  }

  /**
   * Fetches relevant knowledge base articles
   * @param context Message context
   * @returns Array of relevant articles
   */
  private async fetchRelevantArticles(context: MessageContext) {
    const searchTerm = context.previousMessages?.[0]?.content || '';
    
    // If search term is empty, return empty array
    if (!searchTerm.trim()) {
      console.log('Empty search term, skipping article search');
      return [];
    }

    console.log('Original search term:', searchTerm);
    
    // Extract key terms and concepts
    const searchTerms = searchTerm
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace special chars with space
      .split(/\s+/)              // Split on whitespace
      .filter(word => 
        word.length > 2 &&       // Filter out short words
        !['the', 'and', 'for', 'that', 'with', 'you', 'can', 'about', 'tell', 'much'].includes(word)  // Filter common words
      );
    
    // Create different search combinations
    const searchQueries = [
      // Key terms with OR operator
      searchTerms.join(' | '),
      
      // Original query escaped
      `'${searchTerm.replace(/'/g, "''")}'`
    ].filter(query => query.length > 0); // Remove empty strings

    console.log('Search queries:', searchQueries);

    try {
      interface Article {
        id: string;
        title: string;
        content: string;
        category_id: string;
      }

      let allArticles: Article[] = [];

      // First, try to find test articles directly if not skipping them
      if (!context.skipTestArticles) {
        console.log('Looking for test articles first...');
        const { data: testArticles, error: testError } = await supabaseService
          .from('kb_articles')
          .select('id, title, content, category_id')
          .eq('id', context.testArticleId || '')
          .limit(1);

        if (!testError && testArticles && testArticles.length > 0) {
          console.log('Found test article:', testArticles[0].id);
          allArticles = testArticles;
        }
      }

      // If no test articles found or skipping them, try regular search
      if (allArticles.length === 0) {
        // Try each search query until we find articles
        for (const query of searchQueries) {
          console.log('Trying search query:', query);
          
          const { data: articles, error } = await supabaseService
            .from('kb_articles')
            .select('id, title, content, category_id')
            .textSearch('content', query)
            .limit(10);

          if (error) {
            console.error('Error searching articles:', error);
            continue;
          }

          if (articles && articles.length > 0) {
            console.log(`Found ${articles.length} articles with query:`, query);
            allArticles = articles;
            break;
          }
        }

        // If no articles found with text search, try title match
        if (allArticles.length === 0) {
          console.log('Trying direct title match');
          const { data: articles, error } = await supabaseService
            .from('kb_articles')
            .select('id, title, content, category_id')
            .ilike('title', `%${searchTerm}%`)
            .limit(10);

          if (!error && articles && articles.length > 0) {
            console.log('Found article by title match');
            allArticles = articles;
          }
        }
      }

      // If still no articles found, return empty array
      if (allArticles.length === 0) {
        console.log('No articles found with any search method');
        return [];
      }

      // Take only the first 5 articles
      return allArticles.slice(0, 5);
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }

  /**
   * Fetches ticket conversation history
   * @param ticketId ID of the ticket
   * @returns Array of previous messages
   */
  private async fetchTicketHistory(ticketId: string) {
    const { data: messages, error } = await supabaseService
      .from('ticket_comments')
      .select('user_id, content, created_at, metadata')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching ticket history:', error);
      return [];
    }
    return (messages || []).map(msg => ({
      role: msg.metadata?.role || 'agent',
      content: msg.content,
      timestamp: msg.created_at,
    }));
  }

  /**
   * Extracts referenced article IDs from the generated response
   * @param response Generated response text
   * @returns Array of article IDs referenced in the response
   */
  private extractUsedArticles(response: string): string[] {
    if (!response) return [];

    // Match both "Article #" and "Article ID:" formats
    const articleIdPattern = /(?:Article #|Article ID:)\s*([a-f0-9-]+)/g;
    const matches = response.matchAll(articleIdPattern);
    const articleIds = new Set<string>();
    
    for (const match of matches) {
      if (match[1]) {
        console.log('Found article ID:', match[1]);
        articleIds.add(match[1]);
      }
    }
    
    const uniqueIds = Array.from(articleIds);
    console.log('Extracted article IDs:', uniqueIds);
    return uniqueIds;
  }

  /**
   * Calculates confidence score for the generated response
   * @param response Generated response
   * @returns Confidence score between 0 and 1
   */
  private calculateConfidence(response: string): number {
    // Enhanced heuristic based on response quality indicators
    const minLength = 50;
    const maxLength = 500;
    const length = response.length;
    
    let score = 0.7; // Base score
    
    // Length-based adjustment
    if (length > minLength) {
      score += 0.1;
    }
    if (length > maxLength) {
      score += 0.1;
    }
    
    // Content quality indicators
    if (response.toLowerCase().match(/empathy|understanding|patience/i)) {
      score += 0.1;
    }
    if (response.match(/\(Article ID: [a-f0-9-]+\)/)) {
      score += 0.1;
    }
    
    // Cap at 1.0
    return Math.min(score, 1.0);
  }

  /**
   * Formats the context for the prompt template
   * @param context The message context to format
   * @returns Formatted context string
   */
  private formatContextForPrompt(context: MessageContext): string {
    // Only include article content and instructions if we have valid database access
    const articleContent = context.hasValidDbAccess && context.relevantArticles?.length ? 
      context.relevantArticles?.map(article => 
        `Article ID: ${article.id}
        Title: ${article.title}
        Content: ${article.content}
        `
      ).join('\n\n') : 'No relevant articles found.';

    const criticalInstructions = context.hasValidDbAccess && context.relevantArticles?.length ? `
    CRITICAL INSTRUCTIONS FOR USING KNOWLEDGE BASE ARTICLES:
    1. You MUST use any relevant knowledge base articles from the context to inform your response
    2. You MUST reference ALL used articles by including their IDs in your response using this format: (Article ID: <id>)
    3. You MUST reference articles at the point where you use their information
    4. You MUST include at least one article reference if relevant articles are provided
    5. You MUST NOT modify or abbreviate the article IDs - use them exactly as provided

    ENHANCEMENT INSTRUCTIONS:
    1. ELABORATE on the information from articles - don't just quote them
    2. COMBINE information from multiple articles when relevant
    3. PROVIDE specific examples or use cases when possible
    4. EXPLAIN concepts in detail, especially technical terms
    5. SYNTHESIZE information to show relationships between different articles` : '';

    return `${articleContent}\n\n${criticalInstructions}`;
  }
} 