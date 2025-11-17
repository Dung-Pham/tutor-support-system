/**
 * File: utils/validators.ts
 * Purpose: Input validation utilities
 * 
 * Features:
 * - UUID validation
 * - Date/DateTime validation
 * - Email validation
 * - Enum validation
 * - Custom validators
 */

import { ValidationError } from './errors';

/**
 * UUID v4 validation
 * @param value Value to validate
 * @returns boolean
 */
export const isValidUUID = (value: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Validate UUID or throw error
 * @param value Value to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateUUID = (value: string, fieldName: string = 'UUID'): void => {
  if (!isValidUUID(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID v4`, {
      field: fieldName,
      value,
    });
  }
};

/**
 * Email validation
 * @param email Email to validate
 * @returns boolean
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate email or throw error
 * @param email Email to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateEmail = (email: string, fieldName: string = 'Email'): void => {
  if (!isValidEmail(email)) {
    throw new ValidationError(`${fieldName} must be a valid email address`, {
      field: fieldName,
      value: email,
    });
  }
};

/**
 * Date validation
 * @param value Value to validate
 * @returns boolean
 */
export const isValidDate = (value: any): boolean => {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate date or throw error
 * @param value Value to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateDate = (value: any, fieldName: string = 'Date'): void => {
  if (!isValidDate(value)) {
    throw new ValidationError(`${fieldName} must be a valid date`, {
      field: fieldName,
      value,
    });
  }
};

/**
 * ISO 8601 DateTime validation
 * @param value Value to validate
 * @returns boolean
 */
export const isValidISO8601 = (value: string): boolean => {
  const iso8601Regex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?$/;
  return iso8601Regex.test(value) && isValidDate(value);
};

/**
 * Validate ISO 8601 DateTime or throw error
 * @param value Value to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateISO8601 = (value: string, fieldName: string = 'DateTime'): void => {
  if (!isValidISO8601(value)) {
    throw new ValidationError(`${fieldName} must be a valid ISO 8601 datetime`, {
      field: fieldName,
      value,
    });
  }
};

/**
 * Validate date range
 * @param startDate Start date
 * @param endDate End date
 * @param fieldNames Field names for error messages
 * @throws ValidationError
 */
export const validateDateRange = (
  startDate: Date,
  endDate: Date,
  fieldNames: { start?: string; end?: string } = {}
): void => {
  const startFieldName = fieldNames.start || 'Start date';
  const endFieldName = fieldNames.end || 'End date';

  validateDate(startDate, startFieldName);
  validateDate(endDate, endFieldName);

  if (startDate >= endDate) {
    throw new ValidationError(`${endFieldName} must be after ${startFieldName}`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }
};

/**
 * Validate future date
 * @param date Date to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateFutureDate = (date: Date, fieldName: string = 'Date'): void => {
  validateDate(date, fieldName);
  const now = new Date();
  
  if (date <= now) {
    throw new ValidationError(`${fieldName} must be in the future`, {
      field: fieldName,
      value: date.toISOString(),
    });
  }
};

/**
 * Validate past date
 * @param date Date to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validatePastDate = (date: Date, fieldName: string = 'Date'): void => {
  validateDate(date, fieldName);
  const now = new Date();
  
  if (date >= now) {
    throw new ValidationError(`${fieldName} must be in the past`, {
      field: fieldName,
      value: date.toISOString(),
    });
  }
};

/**
 * Enum validation
 * @param value Value to validate
 * @param enumValues Array of valid enum values
 * @returns boolean
 */
export const isValidEnum = (value: any, enumValues: any[]): boolean => {
  return enumValues.includes(value);
};

/**
 * Validate enum or throw error
 * @param value Value to validate
 * @param enumValues Array of valid enum values
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateEnum = (
  value: any,
  enumValues: any[],
  fieldName: string = 'Value'
): void => {
  if (!isValidEnum(value, enumValues)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${enumValues.join(', ')}`,
      {
        field: fieldName,
        value,
        allowedValues: enumValues,
      }
    );
  }
};

/**
 * Integer validation
 * @param value Value to validate
 * @returns boolean
 */
export const isInteger = (value: any): boolean => {
  return Number.isInteger(Number(value));
};

/**
 * Validate integer or throw error
 * @param value Value to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateInteger = (value: any, fieldName: string = 'Value'): void => {
  if (!isInteger(value)) {
    throw new ValidationError(`${fieldName} must be an integer`, {
      field: fieldName,
      value,
    });
  }
};

/**
 * Positive integer validation
 * @param value Value to validate
 * @returns boolean
 */
export const isPositiveInteger = (value: any): boolean => {
  return isInteger(value) && Number(value) > 0;
};

/**
 * Validate positive integer or throw error
 * @param value Value to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validatePositiveInteger = (value: any, fieldName: string = 'Value'): void => {
  if (!isPositiveInteger(value)) {
    throw new ValidationError(`${fieldName} must be a positive integer`, {
      field: fieldName,
      value,
    });
  }
};

/**
 * Number range validation
 * @param value Value to validate
 * @param min Minimum value
 * @param max Maximum value
 * @returns boolean
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate number range or throw error
 * @param value Value to validate
 * @param min Minimum value
 * @param max Maximum value
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Value'
): void => {
  if (!isInRange(value, min, max)) {
    throw new ValidationError(`${fieldName} must be between ${min} and ${max}`, {
      field: fieldName,
      value,
      min,
      max,
    });
  }
};

/**
 * String length validation
 * @param value String to validate
 * @param minLength Minimum length
 * @param maxLength Maximum length
 * @returns boolean
 */
export const isValidLength = (
  value: string,
  minLength: number = 0,
  maxLength: number = Infinity
): boolean => {
  return value.length >= minLength && value.length <= maxLength;
};

/**
 * Validate string length or throw error
 * @param value String to validate
 * @param minLength Minimum length
 * @param maxLength Maximum length
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateLength = (
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string = 'Value'
): void => {
  if (!isValidLength(value, minLength, maxLength)) {
    throw new ValidationError(
      `${fieldName} must be between ${minLength} and ${maxLength} characters`,
      {
        field: fieldName,
        value: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
        minLength,
        maxLength,
        actualLength: value.length,
      }
    );
  }
};

/**
 * Required field validation
 * @param value Value to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateRequired = (value: any, fieldName: string = 'Field'): void => {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`, {
      field: fieldName,
    });
  }
};

/**
 * Array validation
 * @param value Value to validate
 * @returns boolean
 */
export const isArray = (value: any): boolean => {
  return Array.isArray(value);
};

/**
 * Validate array or throw error
 * @param value Value to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateArray = (value: any, fieldName: string = 'Value'): void => {
  if (!isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, {
      field: fieldName,
      value,
    });
  }
};

/**
 * Non-empty array validation
 * @param value Array to validate
 * @returns boolean
 */
export const isNonEmptyArray = (value: any): boolean => {
  return isArray(value) && value.length > 0;
};

/**
 * Validate non-empty array or throw error
 * @param value Array to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateNonEmptyArray = (value: any, fieldName: string = 'Array'): void => {
  if (!isNonEmptyArray(value)) {
    throw new ValidationError(`${fieldName} must be a non-empty array`, {
      field: fieldName,
      value,
    });
  }
};

/**
 * URL validation
 * @param url URL to validate
 * @returns boolean
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate URL or throw error
 * @param url URL to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validateURL = (url: string, fieldName: string = 'URL'): void => {
  if (!isValidURL(url)) {
    throw new ValidationError(`${fieldName} must be a valid URL`, {
      field: fieldName,
      value: url,
    });
  }
};

/**
 * Phone number validation (international format)
 * @param phone Phone number to validate
 * @returns boolean
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

/**
 * Validate phone number or throw error
 * @param phone Phone number to validate
 * @param fieldName Field name for error message
 * @throws ValidationError
 */
export const validatePhone = (phone: string, fieldName: string = 'Phone'): void => {
  if (!isValidPhone(phone)) {
    throw new ValidationError(`${fieldName} must be a valid phone number`, {
      field: fieldName,
      value: phone,
    });
  }
};

/**
 * Composite validator - validate multiple conditions
 * @param validators Array of validator functions
 */
export const validateAll = (validators: Array<() => void>): void => {
  const errors: ValidationError[] = [];

  for (const validator of validators) {
    try {
      validator();
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error);
      } else {
        throw error;
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Multiple validation errors occurred', {
      errors: errors.map((e) => ({
        message: e.message,
        details: e.details,
      })),
    });
  }
};

// Export all validators
export default {
  isValidUUID,
  validateUUID,
  isValidEmail,
  validateEmail,
  isValidDate,
  validateDate,
  isValidISO8601,
  validateISO8601,
  validateDateRange,
  validateFutureDate,
  validatePastDate,
  isValidEnum,
  validateEnum,
  isInteger,
  validateInteger,
  isPositiveInteger,
  validatePositiveInteger,
  isInRange,
  validateRange,
  isValidLength,
  validateLength,
  validateRequired,
  isArray,
  validateArray,
  isNonEmptyArray,
  validateNonEmptyArray,
  isValidURL,
  validateURL,
  isValidPhone,
  validatePhone,
  validateAll,
};
