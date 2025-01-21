import { formatDistanceToNowStrict } from 'date-fns'

export function formatDistanceToNow(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNowStrict(parsedDate, { addSuffix: false })
} 