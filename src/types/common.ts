/**
 * @fileoverview Common utility types
 * @module types/common
 * @description
 * Provides common utility types used throughout the application.
 * Includes generic types for API responses, loading states, and common data structures.
 */

/**
 * Generic async operation state
 * Used for tracking loading, error, and data states
 * 
 * @type {AsyncState<T>}
 * @template T - Type of the data being loaded
 * @property {boolean} loading - Whether the operation is in progress
 * @property {Error | null} error - Error if the operation failed
 * @property {T | null} data - The loaded data if successful
 */
export type AsyncState<T> = {
  loading: boolean;
  error: Error | null;
  data: T | null;
};

/**
 * Generic API response wrapper
 * Standardizes API response format
 * 
 * @type {ApiResponse<T>}
 * @template T - Type of the response data
 * @property {boolean} success - Whether the request was successful
 * @property {T} data - Response data if successful
 * @property {string} [message] - Optional status message
 * @property {string} [error] - Error message if unsuccessful
 */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
};

/**
 * Pagination metadata
 * Used for paginated API responses
 * 
 * @interface PaginationMeta
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} total - Total number of items
 * @property {number} totalPages - Total number of pages
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response wrapper
 * Used for endpoints that return paginated data
 * 
 * @type {PaginatedResponse<T>}
 * @template T - Type of the paginated items
 * @property {T[]} items - Array of items for the current page
 * @property {PaginationMeta} meta - Pagination metadata
 */
export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

/**
 * Sort direction
 * Used for sorting data in tables and lists
 * 
 * @type {SortDirection}
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 * Used to specify sorting parameters
 * 
 * @type {SortConfig}
 * @property {string} field - Field to sort by
 * @property {SortDirection} direction - Sort direction
 */
export type SortConfig = {
  field: string;
  direction: SortDirection;
};

/**
 * Filter operator
 * Used in query filters
 * 
 * @type {FilterOperator}
 */
export type FilterOperator = 
  | 'eq'    // equals
  | 'neq'   // not equals
  | 'gt'    // greater than
  | 'gte'   // greater than or equal
  | 'lt'    // less than
  | 'lte'   // less than or equal
  | 'like'  // string contains
  | 'in'    // value in array
  | 'nin';  // value not in array

/**
 * Filter configuration
 * Used to specify filter parameters
 * 
 * @type {FilterConfig}
 * @property {string} field - Field to filter on
 * @property {FilterOperator} operator - Filter operator
 * @property {any} value - Filter value
 */
export type FilterConfig = {
  field: string;
  operator: FilterOperator;
  value: any;
};
