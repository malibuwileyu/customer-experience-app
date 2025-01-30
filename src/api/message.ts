/**
 * @fileoverview Message Generation API endpoints for OutreachGPT
 * @module api/message
 * @description
 * Handles AI message generation and response endpoints.
 */

import { MessageGenerationService, type MessageContext } from '../services/message-generation.service';

// Create a single instance of the service
let messageService = new MessageGenerationService();

// For testing purposes
export function setMessageService(service: MessageGenerationService) {
  messageService = service;
}

/**
 * Generate an AI response
 */
export async function generateMessage(request: Request) {
  try {
    const { prompt, context } = await request.json() as {
      prompt: string;
      context: MessageContext;
    };

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const result = await messageService.generateResponse(prompt, context);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to generate message:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate message' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Invalid request body:', error);
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 