/**
 * @fileoverview AI Service for OutreachGPT implementation
 * @module services/ai
 * @description
 * Core AI service that handles OpenAI interactions, error handling,
 * and provides base functionality for AI features.
 */

import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, type Runnable } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

/**
 * Error types specific to AI operations
 */
export enum AIErrorType {
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMIT = 'RATE_LIMIT',
  CONTEXT_LENGTH = 'CONTEXT_LENGTH',
  GENERATION_ERROR = 'GENERATION_ERROR',
  CHAIN_ERROR = 'CHAIN_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  CONTEXT_ERROR = 'CONTEXT_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom error class for AI-related errors
 */
export class AIError extends Error {
  constructor(
    public type: AIErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * Configuration options for AI operations
 */
export interface AIConfig {
  temperature?: number;
  maxTokens?: number;
  modelName?: string;
  streaming?: boolean;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: AIConfig = {
  temperature: 0.7,
  maxTokens: 500,
  modelName: 'gpt-4-turbo-preview',
  streaming: false,
};

/**
 * Core AI service class for handling AI operations
 */
export class AIService {
  private openai: ChatOpenAI;
  private config: AIConfig;

  constructor(config: Partial<AIConfig> = {}) {
    // Merge provided config with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize OpenAI
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new AIError(
        AIErrorType.INVALID_API_KEY,
        'OpenAI API key is not configured'
      );
    }

    // Initialize Tavily search tool
    const tavilyApiKey = import.meta.env.VITE_TAVILY_API_KEY;
    if (!tavilyApiKey) {
      throw new AIError(
        AIErrorType.INVALID_API_KEY,
        'Tavily API key is not configured'
      );
    }

    try {
      this.openai = new ChatOpenAI({
        apiKey,
        modelName: this.config.modelName,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        streaming: this.config.streaming,
      });
    } catch (error) {
      throw new AIError(
        AIErrorType.INVALID_API_KEY,
        'Failed to initialize AI services',
        error
      );
    }
  }

  /**
   * Creates a new chain with the given prompt template
   * @param template The prompt template string
   * @param inputVariables Array of input variable names
   * @returns A new runnable chain
   */
  protected async createChain(
    template: string,
    inputVariables: string[]
  ): Promise<Runnable> {
    const prompt = new PromptTemplate({
      template,
      inputVariables,
    });

    return RunnableSequence.from([
      prompt,
      this.openai,
      new StringOutputParser()
    ]);
  }

  /**
   * Creates a runnable sequence for complex chains
   * @param components Array of chain components
   * @returns A new runnable chain
   */
  protected createSequence(components: Runnable[]): Runnable {
    // Ensure we have at least one component
    if (components.length === 0) {
      throw new AIError(
        AIErrorType.GENERATION_ERROR,
        'Sequence must have at least one component'
      );
    }

    // Create a sequence by combining components with OpenAI and output parser
    return RunnableSequence.from([
      components[0], // First component
      ...components.slice(1), // Rest of components if any
      this.openai,
      new StringOutputParser()
    ]);
  }

  /**
   * Handles AI operation errors
   * @param error The caught error
   * @throws AIError with appropriate type and message
   */
  protected handleError(error: any): never {
    // Handle rate limiting errors
    if (error?.response?.status === 429) {
      throw new AIError(
        AIErrorType.RATE_LIMIT,
        'AI service rate limit exceeded',
        error
      );
    }

    // Handle context length errors
    if (error?.message?.includes('maximum context length')) {
      throw new AIError(
        AIErrorType.CONTEXT_LENGTH,
        'Input exceeds maximum context length',
        error
      );
    }

    // Handle other OpenAI API errors
    if (error?.response?.status) {
      throw new AIError(
        AIErrorType.GENERATION_ERROR,
        'AI generation failed',
        error
      );
    }

    // Handle unknown errors
    throw new AIError(
      AIErrorType.UNKNOWN,
      'Unknown AI error occurred',
      error
    );
  }
} 