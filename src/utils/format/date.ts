/**
 * @fileoverview Date formatting utilities
 * @module utils/format/date
 * @description
 * Provides utilities for formatting dates and timestamps
 * in a consistent way throughout the application.
 */

/**
 * Default date format options
 * 
 * @type {Intl.DateTimeFormatOptions}
 */
export const defaultDateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

/**
 * Default time format options
 * 
 * @type {Intl.DateTimeFormatOptions}
 */
export const defaultTimeOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

/**
 * Default date-time format options
 * 
 * @type {Intl.DateTimeFormatOptions}
 */
export const defaultDateTimeOptions: Intl.DateTimeFormatOptions = {
  ...defaultDateOptions,
  ...defaultTimeOptions,
};

/**
 * Formats a date using the default date format
 * 
 * @function formatDate
 * @param {Date | string | number} date - Date to format
 * @param {Intl.DateTimeFormatOptions} [options] - Format options
 * @returns {string} Formatted date string
 * 
 * @example
 * ```typescript
 * const date = formatDate('2024-01-21');
 * // 'Jan 21, 2024'
 * ```
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = defaultDateOptions
): string {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Formats a time using the default time format
 * 
 * @function formatTime
 * @param {Date | string | number} date - Date to format
 * @param {Intl.DateTimeFormatOptions} [options] - Format options
 * @returns {string} Formatted time string
 * 
 * @example
 * ```typescript
 * const time = formatTime('2024-01-21T14:30:00');
 * // '2:30 PM'
 * ```
 */
export function formatTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = defaultTimeOptions
): string {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Formats a date and time using the default date-time format
 * 
 * @function formatDateTime
 * @param {Date | string | number} date - Date to format
 * @param {Intl.DateTimeFormatOptions} [options] - Format options
 * @returns {string} Formatted date-time string
 * 
 * @example
 * ```typescript
 * const datetime = formatDateTime('2024-01-21T14:30:00');
 * // 'Jan 21, 2024, 2:30 PM'
 * ```
 */
export function formatDateTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = defaultDateTimeOptions
): string {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Gets a relative time string (e.g., "2 hours ago")
 * 
 * @function getRelativeTime
 * @param {Date | string | number} date - Date to format
 * @returns {string} Relative time string
 * 
 * @example
 * ```typescript
 * const relative = getRelativeTime('2024-01-21T12:30:00');
 * // '2 hours ago'
 * ```
 */
export function getRelativeTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) return rtf.format(-years, 'year');
  if (months > 0) return rtf.format(-months, 'month');
  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return rtf.format(-seconds, 'second');
}

/**
 * Formats a duration in milliseconds
 * 
 * @function formatDuration
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 * 
 * @example
 * ```typescript
 * const duration = formatDuration(3661000);
 * // '1h 1m 1s'
 * ```
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ') || '0s';
} 