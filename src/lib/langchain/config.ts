/**
 * @fileoverview LangChain configuration and initialization
 * @module lib/langchain/config
 * @description
 * Configures LangChain components and provides initialization logic
 * for AI services.
 */

import { OpenAI } from '@langchain/openai';
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { Client } from "langsmith";

/**
 * LangChain configuration options
 */
export interface LangChainConfig {
  openAIApiKey: string;
  tavilyApiKey: string;
  langSmithApiKey?: string;
  langSmithProjectName?: string;
}

/**
 * Initializes LangSmith for tracking and evaluation
 * @param config LangChain configuration
 */
export function initializeLangSmith(config: LangChainConfig) {
  if (config.langSmithApiKey) {
    const client = new Client({
      apiKey: config.langSmithApiKey,
    });
    
    // Set project name through environment variable
    process.env.LANGCHAIN_PROJECT = config.langSmithProjectName || 'outreach-gpt';

    return client;
  }
  return null;
}

/**
 * Creates and configures OpenAI model instance
 * @param config LangChain configuration
 * @returns Configured OpenAI instance
 */
export function createOpenAIModel(config: LangChainConfig): OpenAI {
  return new OpenAI({
    openAIApiKey: config.openAIApiKey,
    modelName: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 500,
  });
}

/**
 * Creates and configures Tavily search tool
 * @param config LangChain configuration
 * @returns Configured TavilySearchResults instance
 */
export function createSearchTool(config: LangChainConfig): TavilySearchResults {
  return new TavilySearchResults({
    apiKey: config.tavilyApiKey,
  });
}

/**
 * Validates required API keys
 * @param config LangChain configuration
 * @throws Error if required keys are missing
 */
export function validateConfig(config: LangChainConfig): void {
  if (!config.openAIApiKey) {
    throw new Error('OpenAI API key is required');
  }
  if (!config.tavilyApiKey) {
    throw new Error('Tavily API key is required');
  }
} 