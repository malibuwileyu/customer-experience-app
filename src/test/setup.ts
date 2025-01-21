/**
 * @fileoverview Global test setup configuration
 * @module test/setup
 * @description
 * Configures global test setup and teardown using Vitest and React Testing Library.
 * Ensures proper cleanup after each test to prevent test pollution.
 */

import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Add Testing Library matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInTheDocument(): void;
    toBeDisabled(): void;
    toHaveValue(value: string): void;
    toBeVisible(): void;
    toHaveTextContent(text: string): void;
    toHaveAttribute(attr: string, value?: string): void;
  }
}

// Mock scrollIntoView for Radix UI
Element.prototype.scrollIntoView = vi.fn()

// Mock hasPointerCapture for Radix UI
Element.prototype.hasPointerCapture = vi.fn()
Element.prototype.setPointerCapture = vi.fn()
Element.prototype.releasePointerCapture = vi.fn()

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock pointer capture
const pointerCaptureMock = {
  hasPointerCapture: vi.fn(),
  setPointerCapture: vi.fn(),
  releasePointerCapture: vi.fn(),
}

// Add mocks to global
vi.stubGlobal('ResizeObserver', ResizeObserverMock)
Object.defineProperties(window.HTMLElement.prototype, {
  hasPointerCapture: { value: pointerCaptureMock.hasPointerCapture },
  setPointerCapture: { value: pointerCaptureMock.setPointerCapture },
  releasePointerCapture: { value: pointerCaptureMock.releasePointerCapture },
}) 