/**
 * @fileoverview Authentication validation utilities
 * @module utils/auth/validation
 * @description
 * Provides validation functions for authentication-related
 * data like passwords, emails, and user input.
 */

/**
 * Password validation rules
 * 
 * @type {Object}
 * @property {RegExp} minLength - Minimum 8 characters
 * @property {RegExp} uppercase - At least one uppercase letter
 * @property {RegExp} lowercase - At least one lowercase letter
 * @property {RegExp} number - At least one number
 * @property {RegExp} special - At least one special character
 */
export const passwordRules = {
  minLength: /.{8,}/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*(),.?":{}|<>]/,
};

/**
 * Email validation regex
 * Basic email format validation
 * 
 * @type {RegExp}
 */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a password against all rules
 * 
 * @function validatePassword
 * @param {string} password - Password to validate
 * @returns {Object} Validation results for each rule
 * 
 * @example
 * ```typescript
 * const results = validatePassword('Password123!');
 * // {
 * //   minLength: true,
 * //   uppercase: true,
 * //   lowercase: true,
 * //   number: true,
 * //   special: true,
 * //   isValid: true
 * // }
 * ```
 */
export function validatePassword(password: string) {
  const results = {
    minLength: passwordRules.minLength.test(password),
    uppercase: passwordRules.uppercase.test(password),
    lowercase: passwordRules.lowercase.test(password),
    number: passwordRules.number.test(password),
    special: passwordRules.special.test(password),
  };

  return {
    ...results,
    isValid: Object.values(results).every(Boolean),
  };
}

/**
 * Validates an email address
 * 
 * @function validateEmail
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 * 
 * @example
 * ```typescript
 * const isValid = validateEmail('user@example.com');
 * // true
 * ```
 */
export function validateEmail(email: string): boolean {
  return emailRegex.test(email);
}

/**
 * Gets a human-readable password requirement message
 * 
 * @function getPasswordRequirements
 * @returns {string} Password requirements message
 */
export function getPasswordRequirements(): string {
  return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
}

/**
 * Gets specific password validation error messages
 * 
 * @function getPasswordErrors
 * @param {string} password - Password to validate
 * @returns {string[]} Array of error messages
 * 
 * @example
 * ```typescript
 * const errors = getPasswordErrors('weak');
 * // [
 * //   'Password must be at least 8 characters long',
 * //   'Password must contain at least one uppercase letter',
 * //   'Password must contain at least one number',
 * //   'Password must contain at least one special character'
 * // ]
 * ```
 */
export function getPasswordErrors(password: string): string[] {
  const validation = validatePassword(password);
  const errors: string[] = [];

  if (!validation.minLength) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!validation.uppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!validation.lowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!validation.number) {
    errors.push('Password must contain at least one number');
  }
  if (!validation.special) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
} 