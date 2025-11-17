/**
 * File: controllers/authController.ts
 * Mục đích: Authentication controller
 * Vai trò:
 *   - Xử lý login, register requests
 *   - Hash passwords, generate JWT tokens
 *   - Validate input data
 * Lưu ý:
 *   - Password phải hash với bcrypt trước khi lưu DB
 *   - JWT token có expiration time (7 days default)
 */

import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getUserByEmail, createUser } from '../database/queries/userQueries';
import { ApiResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 days

interface LoginRequestBody {
  email: string;
  password: string;
}

interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'USER' | 'TUTOR';
}

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body as LoginRequestBody;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Get user by email
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is not suspended (allow active, inactive status)
    // if (user.status === 'suspended') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Account is not active',
    //   });
    // }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password)
    const { password_hash, ...userData } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, name, phone, role } = req.body as RegisterRequestBody;

    // Validate input
    if (!email || !password || !name || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: email, password, name, phone, role',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Validate role
    if (!['USER', 'TUTOR'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either USER or TUTOR',
      });
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const userId = randomUUID();
    const newUser = await createUser({
      user_id: userId,
      email,
      password_hash,
      name,
      phone,
      role,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.user_id,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password)
    const { password_hash: _, ...userData } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: userData,
        token,
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get current user (requires authentication)
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    // User đã được attach vào req bởi authenticate middleware
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User retrieved',
      data: user,
    } as ApiResponse);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
