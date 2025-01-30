/**
 * @fileoverview Tests for AI feature store
 * @module stores/__tests__/ai.store
 */

// Import mocks first
const { mockGenerateResponse } = vi.hoisted(() => ({ mockGenerateResponse: vi.fn() }))
const { mockSubmitFeedback, mockGetFeedback, mockGetFeedbackMetrics } = vi.hoisted(() => ({
  mockSubmitFeedback: vi.fn(),
  mockGetFeedback: vi.fn(),
  mockGetFeedbackMetrics: vi.fn()
}))

// Mock modules
vi.mock('../../services/message-generation.service', () => ({
  MessageGenerationService: vi.fn().mockImplementation(() => ({
    generateResponse: mockGenerateResponse
  }))
}))

vi.mock('../../services/feedback.service', () => ({
  FeedbackService: vi.fn().mockImplementation(() => ({
    submitFeedback: mockSubmitFeedback,
    getFeedback: mockGetFeedback,
    getFeedbackMetrics: mockGetFeedbackMetrics
  })),
  FeedbackRating: {
    POOR: 1,
    FAIR: 2,
    GOOD: 3,
    EXCELLENT: 4
  },
  FeedbackCategory: {
    ACCURACY: 'accuracy',
    RELEVANCE: 'relevance',
    TONE: 'tone',
    CLARITY: 'clarity',
    COMPLETENESS: 'completeness'
  }
}))

// Regular imports
import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAIStore } from '../ai.store'
import type { MessageContext, GeneratedMessage } from '../../services/message-generation.service'
import type { FeedbackRating, FeedbackCategory } from '../../services/feedback.service'
import type { Feedback } from '../../types/store/ai.store'

describe('AI Store', () => {
  const mockContext: MessageContext = {
    hasValidDbAccess: true,
    ticketId: 'test-ticket',
    customerId: 'test-customer',
    previousMessages: [],
    relevantArticles: []
  }

  const mockMessage: GeneratedMessage = {
    content: 'Generated message',
    context: {
      usedArticles: [],
      confidence: 0.9,
      tone: 'professional'
    }
  }

  beforeEach(() => {
    const store = useAIStore.getState()
    store.reset()
    vi.clearAllMocks()

    // Setup default mock implementations
    mockGenerateResponse.mockResolvedValue(mockMessage)
    mockSubmitFeedback.mockResolvedValue({ id: '1', rating: 3 })
    mockGetFeedback.mockResolvedValue([{ id: '1', rating: 3 }])
    mockGetFeedbackMetrics.mockResolvedValue({ total: 1, good: 1, bad: 0 })
  })

  it('should set and update draft', () => {
    const store = useAIStore.getState()
    const draft = {
      prompt: 'Initial draft',
      context: mockContext
    }

    store.setDraft(draft)
    expect(store.draft).toEqual(draft)

    store.updateDraft({ prompt: 'Updated draft' })
    expect(store.draft?.prompt).toBe('Updated draft')
  })

  it('should clear draft and generated message', () => {
    const store = useAIStore.getState()
    const draft = {
      prompt: 'Draft',
      context: mockContext
    }

    store.setDraft(draft)
    store.generateMessage(draft.prompt, draft.context)
    
    store.clearDraft()
    expect(store.draft).toBeNull()
    expect(store.generatedMessage).toBeNull()
  })

  it('should generate message', async () => {
    const store = useAIStore.getState()
    const draft = {
      prompt: 'Test draft',
      context: mockContext
    }
    
    await store.generateMessage(draft.prompt, draft.context)
    
    expect(mockGenerateResponse).toHaveBeenCalledWith(draft.prompt, draft.context)
    expect(store.generatedMessage).toEqual(mockMessage)
    expect(store.isGenerating).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should handle generation error', async () => {
    const store = useAIStore.getState()
    const draft = {
      prompt: 'Test draft',
      context: mockContext
    }
    const error = new Error('Generation failed')
    mockGenerateResponse.mockRejectedValueOnce(error)
    
    await store.generateMessage(draft.prompt, draft.context)
    
    expect(store.error).toEqual(error)
    expect(store.isGenerating).toBe(false)
    expect(store.generatedMessage).toBeNull()
  })

  it('should regenerate message using draft', async () => {
    const store = useAIStore.getState()
    const draft = {
      prompt: 'Test draft',
      context: mockContext
    }
    
    store.setDraft(draft)
    await store.regenerateMessage()
    
    expect(mockGenerateResponse).toHaveBeenCalledWith(draft.prompt, draft.context)
    expect(store.generatedMessage).toEqual(mockMessage)
    expect(store.isGenerating).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should submit feedback', async () => {
    const store = useAIStore.getState()
    const feedback: Omit<Feedback, 'createdAt'> = {
      messageId: 'test-message',
      rating: 3,
      category: 'accuracy',
      comment: 'Great response'
    }
    
    await store.submitFeedback(feedback)
    
    expect(mockSubmitFeedback).toHaveBeenCalledWith({
      ...feedback,
      createdAt: expect.any(String)
    })
    expect(store.isSubmittingFeedback).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should get feedback', async () => {
    const store = useAIStore.getState()
    const messageId = 'test-message'
    
    await store.getFeedback(messageId)
    
    expect(mockGetFeedback).toHaveBeenCalledWith(messageId)
    expect(store.feedback).toEqual([{ id: '1', rating: 3 }])
    expect(store.isSubmittingFeedback).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should set and clear error', () => {
    const store = useAIStore.getState()
    const error = new Error('Test error')

    store.setError(error)
    expect(store.error).toEqual(error)

    store.setError(null)
    expect(store.error).toBeNull()
  })

  it('should reset store to initial state', () => {
    const store = useAIStore.getState()
    const draft = {
      prompt: 'Draft',
      context: mockContext
    }
    
    store.setDraft(draft)
    store.setError(new Error('Error'))
    
    store.reset()
    
    expect(store.draft).toBeNull()
    expect(store.generatedMessage).toBeNull()
    expect(store.error).toBeNull()
    expect(store.isGenerating).toBe(false)
    expect(store.isSubmittingFeedback).toBe(false)
    expect(store.feedback).toEqual([])
  })
}) 
