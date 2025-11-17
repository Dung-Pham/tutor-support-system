/**
 * File: utils/response.ts
 * Purpose: Standardized response formatting for API responses
 * 
 * Features:
 * - Consistent response structure
 * - Success and error response helpers
 * - Pagination support
 * - Type-safe response builders
 */

import { Response } from 'express';
import { ApplicationError, formatError } from './errors';

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
    code?: string;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Response builder class
 */
class ResponseBuilder {
  /**
   * Send success response
   * @param res Express response object
   * @param data Response data
   * @param statusCode HTTP status code (default: 200)
   * @param meta Additional metadata
   */
  success<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    meta?: Record<string, any>
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send success response with message only
   * @param res Express response object
   * @param message Success message
   * @param statusCode HTTP status code (default: 200)
   */
  message(res: Response, message: string, statusCode: number = 200): Response {
    return this.success(res, { message }, statusCode);
  }

  /**
   * Send created response (201)
   * @param res Express response object
   * @param data Created resource data
   * @param meta Additional metadata
   */
  created<T>(res: Response, data: T, meta?: Record<string, any>): Response {
    return this.success(res, data, 201, meta);
  }

  /**
   * Send no content response (204)
   * @param res Express response object
   */
  noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send paginated response
   * @param res Express response object
   * @param data Array of items
   * @param page Current page number
   * @param limit Items per page
   * @param total Total number of items
   * @param meta Additional metadata
   */
  paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    meta?: Record<string, any>
  ): Response {
    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<T[]> = {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    return res.status(200).json(response);
  }

  /**
   * Send error response
   * @param res Express response object
   * @param error Error object or message
   * @param statusCode HTTP status code (default: 500)
   * @param details Additional error details
   */
  error(
    res: Response,
    error: Error | string,
    statusCode: number = 500,
    details?: any
  ): Response {
    let errorMessage: string;
    let errorDetails: any = details;
    let code: number = statusCode;

    if (error instanceof ApplicationError) {
      const formatted = formatError(error);
      errorMessage = formatted.message;
      code = formatted.statusCode;
      errorDetails = formatted.details || details;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = error;
    }

    const response: ApiResponse = {
      success: false,
      error: {
        message: errorMessage,
        details: errorDetails,
        code: this.getErrorCode(code),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(code).json(response);
  }

  /**
   * Send validation error response
   * @param res Express response object
   * @param errors Array of validation errors
   */
  validationError(res: Response, errors: any[]): Response {
    return this.error(res, 'Validation failed', 400, { errors });
  }

  /**
   * Send not found error response
   * @param res Express response object
   * @param resource Resource name
   * @param identifier Optional identifier
   */
  notFound(res: Response, resource: string = 'Resource', identifier?: string | number): Response {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    return this.error(res, message, 404);
  }

  /**
   * Send unauthorized error response
   * @param res Express response object
   * @param message Optional custom message
   */
  unauthorized(res: Response, message: string = 'Authentication required'): Response {
    return this.error(res, message, 401);
  }

  /**
   * Send forbidden error response
   * @param res Express response object
   * @param message Optional custom message
   */
  forbidden(res: Response, message: string = 'Access denied'): Response {
    return this.error(res, message, 403);
  }

  /**
   * Send conflict error response
   * @param res Express response object
   * @param message Optional custom message
   * @param details Optional details
   */
  conflict(res: Response, message: string = 'Conflict occurred', details?: any): Response {
    return this.error(res, message, 409, details);
  }

  /**
   * Send bad request error response
   * @param res Express response object
   * @param message Optional custom message
   * @param details Optional details
   */
  badRequest(res: Response, message: string = 'Bad request', details?: any): Response {
    return this.error(res, message, 400, details);
  }

  /**
   * Send internal server error response
   * @param res Express response object
   * @param message Optional custom message
   */
  internalError(res: Response, message: string = 'Internal server error'): Response {
    return this.error(res, message, 500);
  }

  /**
   * Send service unavailable error response
   * @param res Express response object
   * @param message Optional custom message
   */
  serviceUnavailable(res: Response, message: string = 'Service temporarily unavailable'): Response {
    return this.error(res, message, 503);
  }

  /**
   * Get error code string from status code
   * @param statusCode HTTP status code
   * @returns Error code string
   */
  private getErrorCode(statusCode: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };

    return codes[statusCode] || 'UNKNOWN_ERROR';
  }
}

// Export singleton instance
const responseBuilder = new ResponseBuilder();

/**
 * Response helper functions (for backward compatibility)
 */

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200
): Response => {
  return responseBuilder.success(res, data, statusCode);
};

export const sendError = (
  res: Response,
  error: Error | string,
  statusCode: number = 500
): Response => {
  return responseBuilder.error(res, error, statusCode);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): Response => {
  return responseBuilder.paginated(res, data, page, limit, total);
};

/**
 * Express middleware for adding response helpers to res object
 */
export const responseMiddleware = (_req: any, res: Response, next: Function) => {
  // Attach response builder methods to res object
  res.sendSuccess = responseBuilder.success.bind(responseBuilder);
  res.sendError = responseBuilder.error.bind(responseBuilder);
  res.sendPaginated = responseBuilder.paginated.bind(responseBuilder);
  res.sendMessage = responseBuilder.message.bind(responseBuilder);
  res.sendCreated = responseBuilder.created.bind(responseBuilder);
  res.sendNoContent = responseBuilder.noContent.bind(responseBuilder);
  res.sendValidationError = responseBuilder.validationError.bind(responseBuilder);
  res.sendNotFound = responseBuilder.notFound.bind(responseBuilder);
  res.sendUnauthorized = responseBuilder.unauthorized.bind(responseBuilder);
  res.sendForbidden = responseBuilder.forbidden.bind(responseBuilder);
  res.sendConflict = responseBuilder.conflict.bind(responseBuilder);
  res.sendBadRequest = responseBuilder.badRequest.bind(responseBuilder);

  next();
};

// Extend Express Response interface
declare global {
  namespace Express {
    interface Response {
      sendSuccess: <T>(data: T, statusCode?: number, meta?: Record<string, any>) => Response;
      sendError: (error: Error | string, statusCode?: number, details?: any) => Response;
      sendPaginated: <T>(
        data: T[],
        page: number,
        limit: number,
        total: number,
        meta?: Record<string, any>
      ) => Response;
      sendMessage: (message: string, statusCode?: number) => Response;
      sendCreated: <T>(data: T, meta?: Record<string, any>) => Response;
      sendNoContent: () => Response;
      sendValidationError: (errors: any[]) => Response;
      sendNotFound: (resource?: string, identifier?: string | number) => Response;
      sendUnauthorized: (message?: string) => Response;
      sendForbidden: (message?: string) => Response;
      sendConflict: (message?: string, details?: any) => Response;
      sendBadRequest: (message?: string, details?: any) => Response;
    }
  }
}

// Export default response builder instance
export default responseBuilder;
