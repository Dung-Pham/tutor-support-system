/**
 * File: middlewares/auth.ts
 * Mục đích: JWT authentication middleware
 * Vai trò:
 *   - Verify JWT token từ Authorization header
 *   - Attach user info vào req.user
 *   - Protect routes yêu cầu authentication
 * Lưu ý:
 *   - Token format: "Bearer <token>"
 *   - JWT_SECRET phải được set trong .env
 */

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { getUserById } from '../database/queries/userQueries';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Middleware xác thực JWT token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Get fresh user data from database
    const user = await getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'User not found',
      });
      return;
    }

    // if (user.status === 'suspended' || user.status === 'deleted') {
    //   res.status(403).json({
    //     success: false,
    //     message: 'Account is not active',
    //     error: 'User account is disabled',
    //   });
    //   return;
    // }

    // Attach user to request
    req.user = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: err.message,
      });
      return;
    }

    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'Please login again',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Middleware kiểm tra role
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: `Role '${req.user.role}' is not allowed to access this resource`,
      });
      return;
    }

    next();
  };
};
