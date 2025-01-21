/**
 * @fileoverview Global test setup configuration
 * @module test/setup
 * @description
 * Configures global test setup and teardown using Vitest and React Testing Library.
 * Ensures proper cleanup after each test to prevent test pollution.
 */

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * Global cleanup after each test
 * 
 * Automatically runs after each test to:
 * - Clean up mounted React components
 * - Reset DOM manipulations
 * - Clear event listeners
 * - Reset React Testing Library's internal state
 */
afterEach(() => {
  cleanup()
}) 