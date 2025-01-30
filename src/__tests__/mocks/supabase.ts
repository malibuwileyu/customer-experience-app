import { vi } from 'vitest'
import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js'

// Create chainable mock builder
export function createMockQueryBuilder() {
  const mockChain: any = {
    select: vi.fn(() => mockChain),
    insert: vi.fn(() => mockChain),
    update: vi.fn(() => mockChain),
    delete: vi.fn(() => mockChain),
    eq: vi.fn(() => mockChain),
    order: vi.fn(() => mockChain),
    single: vi.fn(() => mockChain),
    textSearch: vi.fn(() => mockChain),
    is: vi.fn(() => mockChain),
    in: vi.fn(() => mockChain),
    match: vi.fn(() => mockChain),
    gte: vi.fn(() => mockChain),
    lte: vi.fn(() => mockChain),
    neq: vi.fn(() => mockChain),
    like: vi.fn(() => mockChain),
    ilike: vi.fn(() => mockChain),
    filter: vi.fn(() => mockChain),
    not: vi.fn(() => mockChain),
    or: vi.fn(() => mockChain),
    and: vi.fn(() => mockChain),
    contains: vi.fn(() => mockChain),
    containedBy: vi.fn(() => mockChain),
    range: vi.fn(() => mockChain),
    limit: vi.fn(() => mockChain),
    offset: vi.fn(() => mockChain),
    maybeSingle: vi.fn(() => mockChain),
    then: vi.fn((callback) => Promise.resolve(callback(mockChain._response)))
  }

  // Make each method return a chainable mock
  Object.keys(mockChain).forEach(key => {
    if (key !== 'then') {
      mockChain[key].mockReturnValue(mockChain)
    }
  })

  return mockChain
}

// Create mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
    refreshSession: vi.fn(),
    setSession: vi.fn()
  },
  from: vi.fn()
}

// Reset all mocks between tests
export function resetSupabaseMocks() {
  vi.clearAllMocks()
  mockSupabaseClient.auth.getUser.mockReset()
  mockSupabaseClient.auth.signInWithPassword.mockReset()
  mockSupabaseClient.auth.signOut.mockReset()
  mockSupabaseClient.auth.onAuthStateChange.mockReset()
  mockSupabaseClient.auth.getSession.mockReset()
  mockSupabaseClient.auth.refreshSession.mockReset()
  mockSupabaseClient.auth.setSession.mockReset()
  mockSupabaseClient.from.mockReset()
}

// Mock the Supabase module
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient
}))

// Mock user data
export const mockAuthUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-19T00:00:00.000Z',
  role: 'authenticated',
  updated_at: '2024-01-19T00:00:00.000Z'
}

// Helper to create mock responses
export function createMockResponse<T>(data: T, error: any = null): PostgrestSingleResponse<T> {
  return {
    data,
    error,
    count: null,
    status: error ? 400 : 200,
    statusText: error ? 'Bad Request' : 'OK'
  }
}

// Helper to create mock list responses
export function createMockListResponse<T>(data: T[], error: any = null): PostgrestResponse<T> {
  return {
    data,
    error,
    count: data.length,
    status: error ? 400 : 200,
    statusText: error ? 'Bad Request' : 'OK'
  }
}

// Helper to create mock query builder with response
export function setupMockTableQuery<T>(tableName: string, response: PostgrestResponse<T> | PostgrestSingleResponse<T>) {
  const mockChain = createMockQueryBuilder()
  mockChain._response = response
  mockSupabaseClient.from.mockImplementation((table: string) => {
    if (table === tableName) {
      return mockChain
    }
    return createMockQueryBuilder()
  })
  return mockChain
} 