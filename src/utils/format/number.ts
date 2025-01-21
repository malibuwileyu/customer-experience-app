/**
 * @fileoverview Number formatting utilities
 * @module utils/format/number
 * @description
 * Provides utilities for formatting numbers in a consistent way
 * throughout the application, including currency and percentages.
 */

/**
 * Default number format options
 * 
 * @type {Intl.NumberFormatOptions}
 */
export const defaultNumberOptions: Intl.NumberFormatOptions = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
};

/**
 * Default currency format options
 * 
 * @type {Intl.NumberFormatOptions}
 */
export const defaultCurrencyOptions: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

/**
 * Default percent format options
 * 
 * @type {Intl.NumberFormatOptions}
 */
export const defaultPercentOptions: Intl.NumberFormatOptions = {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
};

/**
 * Formats a number using the default number format
 * 
 * @function formatNumber
 * @param {number} value - Number to format
 * @param {Intl.NumberFormatOptions} [options] - Format options
 * @returns {string} Formatted number string
 * 
 * @example
 * ```typescript
 * const num = formatNumber(1234.5678);
 * // '1,234.57'
 * ```
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = defaultNumberOptions
): string {
  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Formats a number as currency
 * 
 * @function formatCurrency
 * @param {number} value - Number to format
 * @param {string} [currency='USD'] - Currency code
 * @param {Intl.NumberFormatOptions} [options] - Additional format options
 * @returns {string} Formatted currency string
 * 
 * @example
 * ```typescript
 * const price = formatCurrency(1234.567);
 * // '$1,234.57'
 * ```
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  options: Intl.NumberFormatOptions = {}
): string {
  return formatNumber(value, {
    ...defaultCurrencyOptions,
    currency,
    ...options,
  });
}

/**
 * Formats a number as a percentage
 * 
 * @function formatPercent
 * @param {number} value - Number to format (0-1)
 * @param {Intl.NumberFormatOptions} [options] - Additional format options
 * @returns {string} Formatted percentage string
 * 
 * @example
 * ```typescript
 * const percent = formatPercent(0.1234);
 * // '12.3%'
 * ```
 */
export function formatPercent(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return formatNumber(value, {
    ...defaultPercentOptions,
    ...options,
  });
}

/**
 * Formats a file size in bytes to a human-readable string
 * 
 * @function formatFileSize
 * @param {number} bytes - Size in bytes
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted file size string
 * 
 * @example
 * ```typescript
 * const size = formatFileSize(1234567);
 * // '1.18 MB'
 * ```
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Formats a number with metric prefixes (K, M, B, T)
 * 
 * @function formatMetric
 * @param {number} value - Number to format
 * @param {number} [decimals=1] - Number of decimal places
 * @returns {string} Formatted metric string
 * 
 * @example
 * ```typescript
 * const metric = formatMetric(1234567);
 * // '1.2M'
 * ```
 */
export function formatMetric(value: number, decimals: number = 1): string {
  if (value === 0) return '0';

  const k = 1000;
  const sizes = ['', 'K', 'M', 'B', 'T'];
  const i = Math.floor(Math.log(Math.abs(value)) / Math.log(k));

  if (i === 0) return value.toString();
  return `${parseFloat((value / Math.pow(k, i)).toFixed(decimals))}${sizes[i]}`;
} 