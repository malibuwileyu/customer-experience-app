/**
 * @fileoverview Class name utility for Tailwind CSS
 * @module utils/cn
 * @description
 * Provides a utility function for merging Tailwind CSS classes
 * using clsx for conditional classes and tailwind-merge for
 * deduplication and conflict resolution.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges multiple class names or conditional class objects
 * 
 * Combines the functionality of clsx (for conditional classes)
 * with tailwind-merge (for Tailwind-specific class deduplication).
 * 
 * @function cn
 * @param {...ClassValue[]} inputs - Class names, objects, or arrays to merge
 * @returns {string} Merged and deduplicated class string
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500');
 * // => 'px-4 py-2 bg-blue-500'
 * 
 * // With conditions
 * cn('px-4 py-2', {
 *   'bg-blue-500': isPrimary,
 *   'bg-gray-500': !isPrimary
 * });
 * 
 * // Handles conflicting classes
 * cn('px-2 py-1 bg-red-500', 'px-4 bg-blue-500');
 * // => 'py-1 px-4 bg-blue-500'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 