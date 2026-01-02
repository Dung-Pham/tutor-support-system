// User Controller - Merged from HEAD and dang branches
// Supports both SQL Server queries (HEAD) and Sequelize models (dang)

import { Request, Response } from 'express';
import * as userService from '../services/userService.js';
import { User } from '../models/sql/index.js';
import { AuthRequest } from '../types/common.js';
import { Op } from 'sequelize';

// ============================================
// Interfaces
// ============================================
interface PaginationQuery {
  page?: string;
  limit?: string;
  role?: string;
  status?: string;
  subjects?: string;
  minRating?: string;
}

interface UpdateStatusBody {
  isActive: boolean;
}

interface UserParams {
  id: string;
}

// ============================================
// dang Functions - Using Sequelize Models
// ============================================

/**
 * Get current authenticated user (dang)
 * GET /api/users/me
 */
export const authMe = (req: AuthRequest, res: Response): Response => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User info retrieved successfully',
      user: req.user,
    });
  } catch (error) {
    console.error('Error in authMe', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get all users with pagination - Sequelize (dang)
 * GET /api/users
 */
export const getAllUsers = async (
  req: Request<object, object, object, PaginationQuery>,
  res: Response
): Promise<Response> => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const { count: total, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['passwordHash'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting users', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Update user status - Sequelize (dang)
 * PATCH /api/users/:id/status
 */
export const updateUserStatus = async (
  req: Request<UserParams, object, UpdateStatusBody>,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.update({ isActive });

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    console.error('Error updating user status', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get all tutors - Sequelize (dang)
 * GET /api/users/tutors
 */
export const getTutors = async (
  req: Request<object, object, object, PaginationQuery>,
  res: Response
): Promise<Response> => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const { count: total, rows: tutors } = await User.findAndCountAll({
      where: {
        role: 'tutor',
        status: true,
      },
      attributes: [
        ['user_id', 'id'],
        ['name', 'displayName'],
        ['avatar_url', 'avatarUrl'],
        'bio',
        ['created_at', 'createdAt'],
      ],
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      message: 'Tutors retrieved successfully',
      data: tutors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting tutors', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// ============================================
// HEAD Functions - Using userService
// ============================================

/**
 * Get all users - userService (HEAD)
 * GET /api/users
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const status = req.query.status as string;

    const result = await userService.getUsers({ page, limit, role, status });

    res.status(200).json({
      success: true,
      count: result.users.length,
      total: result.total,
      page,
      limit,
      data: result.users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
}

/**
 * Get single user by ID - userService (HEAD)
 * GET /api/users/:id
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
}

/**
 * Create new user - userService (HEAD)
 * POST /api/users
 */
export async function createUser(req: Request, res: Response) {
  try {
    const { email, password_hash, name, phone, role, avatar_url } = req.body;

    // Basic validation
    if (!email || !password_hash || !name || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password_hash, name, phone, role',
      });
    }

    const user = await userService.createUser({
      email,
      password_hash,
      name,
      phone,
      role,
      avatar_url,
    });

    return res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.message === 'Email already exists') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message,
    });
  }
}

/**
 * Update user - userService (HEAD)
 * PUT /api/users/:id
 */
export async function updateUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const user = await userService.updateUser(userId, updates);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message,
    });
  }
}

/**
 * Delete user (soft delete) - userService (HEAD)
 * DELETE /api/users/:id
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    await userService.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
}

/**
 * Get tutor profile - userService (HEAD)
 * GET /api/users/tutor/:id
 */
export async function getTutorProfile(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const profile = await userService.getTutorProfile(userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    if (error.message === 'Tutor profile not found') {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
}

/**
 * Get student profile - userService (HEAD)
 * GET /api/users/student/:id
 */
export async function getStudentProfile(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const profile = await userService.getStudentProfile(userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    if (error.message === 'Student profile not found') {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
}

/**
 * Get parent profile - userService (HEAD)
 * GET /api/users/parent/:id
 */
export async function getParentProfile(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const profile = await userService.getParentProfile(userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    if (error.message === 'Parent profile not found') {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
}

/**
 * Get all tutors - userService (HEAD)
 * GET /api/users/tutors
 */
export async function getAllTutors(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const subjects = req.query.subjects as string;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;

    const result = await userService.getAllTutors({ page, limit, subjects, minRating });

    res.status(200).json({
      success: true,
      count: result.tutors.length,
      total: result.total,
      page,
      limit,
      data: result.tutors,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
}
