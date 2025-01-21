/**
 * @fileoverview React Query client configuration
 * @module lib/react-query
 * @description
 * Configures and exports a React Query client instance with optimized settings
 * for data fetching, caching, and state management. Provides consistent defaults
 * for query behavior across the application.
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Configured React Query client instance
 * 
 * Features:
 * - Optimized stale time (5 minutes)
 * - Extended garbage collection time (30 minutes)
 * - Limited retry attempts (1 retry)
 * - Disabled window focus refetching
 * 
 * @example
 * ```tsx
 * // In your app root
 * import { QueryClientProvider } from '@tanstack/react-query'
 * import { queryClient } from './lib/react-query'
 * 
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <AppContent />
 *     </QueryClientProvider>
 *   )
 * }
 * 
 * // In your components
 * function UserProfile() {
 *   const { data, isLoading } = useQuery({
 *     queryKey: ['user'],
 *     queryFn: fetchUser,
 *     // Will use these default options
 *   })
 * }
 * ```
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Keep unused data in cache for 30 minutes
      retry: 1, // Only retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
}) 