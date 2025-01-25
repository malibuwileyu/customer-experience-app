import { vi } from 'vitest'

// Create base mock functions
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockIn = vi.fn()

// Create mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    single: mockSingle,
    in: mockIn,
  })),
}

// Reset all mocks between tests
export function resetSupabaseMocks() {
  vi.clearAllMocks()
  mockSelect.mockReset()
  mockInsert.mockReset()
  mockUpdate.mockReset()
  mockDelete.mockReset()
  mockEq.mockReset()
  mockSingle.mockReset()
  mockIn.mockReset()
  mockSupabaseClient.auth.getUser.mockReset()
  mockSupabaseClient.auth.signInWithPassword.mockReset()
  mockSupabaseClient.auth.signOut.mockReset()
  mockSupabaseClient.auth.onAuthStateChange.mockReset()
}

// Helper to create chainable mock responses
export function createChainableMock() {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
  }
}

// Mock the Supabase module
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient,
}))

export const mockAuthUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'user',
} 