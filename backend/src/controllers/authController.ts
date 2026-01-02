// Auth Controller - Merged from HEAD and dang branches
// Supports both SQL Server queries (HEAD) and Sequelize models (dang)

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getUserByEmail, createUser } from '../database/queries/userQueries.js';
import { User, Session } from '../models/sql/index.js';
import { ApiResponse } from '../types/index.js';
import { JwtPayload } from '../types/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || 'your-secret-key-change-in-production';
const ACCESS_TOKEN_TTL = '7d'; // 7 days for development
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// ============================================
// Interfaces
// ============================================
interface LoginRequestBody {
  email: string;
  password: string;
}

interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'USER' | 'TUTOR' | 'student' | 'tutor';
  firstName?: string;
  lastName?: string;
}

interface RefreshTokenRequest extends Request {
  cookies: {
    refreshToken?: string;
  };
}

// ============================================
// HEAD Functions - Using SQL Queries
// ============================================

/**
 * Login user (HEAD version - using getUserByEmail)
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

    // Get user by email using SQL query
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password with password_hash from SQL schema
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
      { expiresIn: ACCESS_TOKEN_TTL }
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
 * Register new user (HEAD version - using createUser)
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
    const validRoles = ['USER', 'TUTOR', 'student', 'tutor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be USER, TUTOR, student, or tutor',
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
    const password_hash = await bcrypt.hash(password, 10);

    // Create user using SQL query
    const userId = crypto.randomUUID();
    const newUser = await createUser({
      user_id: userId,
      email,
      password_hash,
      name,
      phone,
      role: role.toUpperCase() === 'STUDENT' ? 'USER' : role.toUpperCase(),
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.user_id,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
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

// ============================================
// dang Functions - Using Sequelize Models
// ============================================

/**
 * Student Registration (dang version - using Sequelize)
 * POST /api/auth/register/student
 */
export const registerStudent = async (
  req: Request<object, object, RegisterRequestBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const duplicate = await User.findOne({ where: { email } });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      hashedPassword,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      role: 'student',
    });

    return res.status(201).json({
      success: true,
      message: 'Student account created successfully',
    });
  } catch (error) {
    console.error('Error in registerStudent', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Tutor Registration (dang version - using Sequelize)
 * POST /api/auth/register/tutor
 */
export const registerTutor = async (
  req: Request<object, object, RegisterRequestBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const duplicate = await User.findOne({ where: { email } });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      hashedPassword,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      role: 'tutor',
    });

    return res.status(201).json({
      success: true,
      message: 'Tutor account created successfully',
    });
  } catch (error) {
    console.error('Error in registerTutor', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Sign In with refresh token (dang version - using Sequelize)
 * POST /api/auth/signin
 */
export const signIn = async (
  req: Request<object, object, LoginRequestBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.',
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshTokenValue = crypto.randomBytes(64).toString('hex');

    await Session.create({
      userId: user.id,
      refreshToken: refreshTokenValue,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie('refreshToken', refreshTokenValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.displayName}!`,
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl || null,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in signIn', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Sign Out - Clear session
 * POST /api/auth/signout
 */
export const signOut = async (
  req: RefreshTokenRequest,
  res: Response
): Promise<Response> => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await Session.destroy({ where: { refreshToken: token } });
    }

    res.clearCookie('refreshToken');

    return res.status(204).send();
  } catch (error) {
    console.error('Error in signOut', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Refresh Token - Get new access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (
  req: RefreshTokenRequest,
  res: Response
): Promise<Response> => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const session = await Session.findOne({ where: { refreshToken: token } });
    if (!session) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    if (session.expiresAt < new Date()) {
      await Session.destroy({ where: { id: session.id } });
      return res.status(403).json({
        success: false,
        message: 'Refresh token has expired',
      });
    }

    // Get user for full payload
    const user = await User.findByPk(session.userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found',
      });
    }

    const payload: JwtPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error('Error in refreshToken', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
