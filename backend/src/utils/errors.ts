/**
 * File: utils/errors.ts
 * Purpose: Custom error classes for consistent error handling
 * 
 * Features:
 * - Specific error types for different scenarios
 * - HTTP status codes mapping
 * - Error details and context
 */

/**
 * Base application error class
 */
export class ApplicationError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - 400
 * Used for invalid input data
 */
export class ValidationError extends ApplicationError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, details);
  }
}

/**
 * Authentication Error - 401
 * Used when user is not authenticated
 */
export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication required', details?: any) {
    super(message, 401, details);
  }
}

/**
 * Authorization Error - 403
 * Used when user doesn't have permission
 */
export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 403, details);
  }
}

/**
 * Not Found Error - 404
 * Used when requested resource doesn't exist
 */
export class NotFoundError extends ApplicationError {
  constructor(
    resource: string = 'Resource',
    identifier?: string | number,
    details?: any
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, details);
  }
}

/**
 * Conflict Error - 409
 * Used for conflicts like duplicate entries, scheduling conflicts, etc.
 */
export class ConflictError extends ApplicationError {
  constructor(message: string = 'Conflict occurred', details?: any) {
    super(message, 409, details);
  }
}

/**
 * Database Error - 500
 * Used for database-related errors
 */
export class DatabaseError extends ApplicationError {
  public query?: string;
  public originalError?: Error;

  constructor(message: string = 'Database error occurred', details?: any, originalError?: Error) {
    super(message, 500, details);
    this.originalError = originalError;
  }
}

/**
 * Bad Request Error - 400
 * Used for malformed requests
 */
export class BadRequestError extends ApplicationError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, details);
  }
}

/**
 * Internal Server Error - 500
 * Used for unexpected server errors
 */
export class InternalServerError extends ApplicationError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, details);
  }
}

/**
 * Service Unavailable Error - 503
 * Used when service is temporarily unavailable
 */
export class ServiceUnavailableError extends ApplicationError {
  constructor(message: string = 'Service temporarily unavailable', details?: any) {
    super(message, 503, details);
  }
}

/**
 * Rate Limit Error - 429
 * Used when rate limit is exceeded
 */
export class RateLimitError extends ApplicationError {
  constructor(message: string = 'Too many requests', details?: any) {
    super(message, 429, details);
  }
}

/**
 * Error handler utility functions
 */

/**
 * Check if error is operational (expected) error
 * @param error Error object
 * @returns boolean
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof ApplicationError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Format error for API response
 * @param error Error object
 * @returns Formatted error object
 */
export const formatError = (error: Error): {
  message: string;
  statusCode: number;
  details?: any;
  stack?: string;
} => {
  if (error instanceof ApplicationError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }

  // For unknown errors
  return {
    message: error.message || 'An unexpected error occurred',
    statusCode: 500,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };
};

/**
 * Convert database errors to appropriate application errors
 * @param error Database error
 * @returns ApplicationError
 */
export const handleDatabaseError = (error: any): ApplicationError => {
  // SQL Server error codes
  if (error.code) {
    switch (error.code) {
      case 'ECONNREFUSED':
        return new ServiceUnavailableError('Database connection refused', {
          originalError: error.message,
        });

      case 'ETIMEOUT':
        return new ServiceUnavailableError('Database connection timeout', {
          originalError: error.message,
        });

      case 'EREQUEST':
        // Check for specific SQL errors
        if (error.number === 2627 || error.number === 2601) {
          // Unique constraint violation
          return new ConflictError('Duplicate entry', {
            originalError: error.message,
          });
        }

        if (error.number === 547) {
          // Foreign key constraint violation
          return new ConflictError('Referenced record not found', {
            originalError: error.message,
          });
        }

        return new DatabaseError('Database query failed', {
          originalError: error.message,
          errorNumber: error.number,
        });

      default:
        return new DatabaseError('Database error', {
          originalError: error.message,
          code: error.code,
        });
    }
  }

  return new DatabaseError('Unknown database error', {
    originalError: error.message,
  });
};

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error middleware
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error logger utility
 * @param error Error object
 * @param context Additional context
 */
export const logError = (error: Error, context?: Record<string, any>): void => {
  const errorLog = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (error instanceof ApplicationError) {
    errorLog['statusCode'] = error.statusCode;
    errorLog['details'] = error.details;
  }

  console.error('❌ Error:', JSON.stringify(errorLog, null, 2));
};

/**
 * Create validation error from validation results
 * @param errors Validation error array
 * @returns ValidationError
 */
export const createValidationError = (errors: any[]): ValidationError => {
  const formattedErrors = errors.map((err) => ({
    field: err.param || err.path,
    message: err.msg || err.message,
    value: err.value,
  }));

  return new ValidationError('Validation failed', {
    errors: formattedErrors,
  });
};

// Export all error classes
export default {
  ApplicationError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  BadRequestError,
  InternalServerError,
  ServiceUnavailableError,
  RateLimitError,
  isOperationalError,
  formatError,
  handleDatabaseError,
  asyncHandler,
  logError,
  createValidationError,
};
