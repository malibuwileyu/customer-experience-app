/**
 * @fileoverview Utility functions for class name management
 * @module lib/utils
 * @description
 * Provides utility functions for managing CSS class names, combining Tailwind classes,
 * and handling conditional class application using clsx and tailwind-merge.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges CSS class names with Tailwind support
 * 
 * Uses clsx for conditional class names and tailwind-merge to handle
 * Tailwind CSS class conflicts and duplicates properly.
 * 
 * @param {...ClassValue[]} inputs - Class names or conditional class objects
 * @returns {string} Merged class string with resolved Tailwind conflicts
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <div className={cn("px-4 py-2", "bg-blue-500")}>
 * 
 * // With conditions
 * <div className={cn(
 *   "base-class",
 *   isActive && "active-class",
 *   { "conditional-class": someCondition }
 * )}>
 * 
 * // Resolving Tailwind conflicts
 * <div className={cn(
 *   "px-2 py-1", // These padding classes
 *   "p-4"        // Will be properly merged
 * )}>
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 