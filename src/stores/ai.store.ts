/**
 * @fileoverview AI store for managing message generation state
 * @module stores/ai
 * @description
 * Zustand store for managing AI-powered message generation state,
 * including loading states, errors, and generated content.
 */

import { create } from 'zustand'

interface GeneratedMessage {
  id: string
  content: string
  createdAt: string
}

interface AIState {
  generatedMessage: GeneratedMessage | null
  isGenerating: boolean
  error: Error | null
  setGenerating: (isGenerating: boolean) => void
  setError: (error: Error | null) => void
  setGeneratedMessage: (message: GeneratedMessage | null) => void
  reset: () => void
}

const initialState = {
  generatedMessage: null,
  isGenerating: false,
  error: null,
}

export const useAIStore = create<AIState>((set) => ({
  ...initialState,

  setGenerating: (isGenerating: boolean) => 
    set({ isGenerating, error: null }),

  setError: (error: Error | null) => 
    set({ error, isGenerating: false }),

  setGeneratedMessage: (message: GeneratedMessage | null) =>
    set({ generatedMessage: message, isGenerating: false, error: null }),

  reset: () => set(initialState),
})) 