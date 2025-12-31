/**
 * File: controllers/classController.ts
 * Purpose: Handle HTTP requests for class management
 */

import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import * as classService from '../services/classService';

/**
 * Get my classes
 * GET /api/classes/my-classes
 * Returns classes for current user (student or tutor)
 */
export const getMyClasses = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role as 'tutor' | 'student';

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
    }

    const classes = await classService.getMyClasses(userId, userRole);

    // Transform for frontend
    const transformed = classes.map((c: any) => ({
      class_id: c.class_id,
      tutor_id: c.tutor_id,
      student_id: c.student_id,
      subject_id: c.subject_id,
      name: c.subject_name || 'Class',
      description: c.description,
      subject: c.subject_name,
      subject_name: c.subject_name,
      grade_level: c.grade_level,
      start_date: c.start_date,
      end_date: c.end_date,
      status: c.status,
      tutor_name: c.tutor_name,
      student_name: c.student_name,
      client_name: userRole === 'tutor' ? c.student_name : c.tutor_name,
      client_id: userRole === 'tutor' ? c.student_id : c.tutor_id,
      sessions_per_week: c.sessions_per_week,
      hourly_price: c.hourly_price,
      session_count: c.schedule_count
    }));

    return res.status(200).json({
      success: true,
      message: 'Classes retrieved successfully',
      data: transformed
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve classes',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get class by ID
 * GET /api/classes/:classId
 */
export const getClassById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const classId = req.params.classId;
    const classInfo = await classService.getClassById(classId);

    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      } as ApiResponse);
    }

    const transformed = {
      class_id: classInfo.class_id,
      tutor_id: classInfo.tutor_id,
      student_id: classInfo.student_id,
      subject_id: classInfo.subject_id,
      name: classInfo.subject_name || 'Class',
      description: classInfo.description,
      subject: classInfo.subject_name,
      subject_name: classInfo.subject_name,
      grade_level: classInfo.grade_level,
      start_date: classInfo.start_date,
      end_date: classInfo.end_date,
      status: classInfo.status,
      tutor_name: classInfo.tutor_name,
      student_name: classInfo.student_name,
      sessions_per_week: classInfo.sessions_per_week,
      hourly_price: classInfo.hourly_price
    };

    return res.status(200).json({
      success: true,
      message: 'Class retrieved successfully',
      data: transformed
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve class',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get active classes (for calendar/schedule)
 * GET /api/classes/active
 */
export const getActiveClasses = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role as 'tutor' | 'student';

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
    }

    const classes = await classService.getActiveClasses(userId, userRole);

    const transformed = classes.map((c: any) => ({
      class_id: c.class_id,
      tutor_id: c.tutor_id,
      student_id: c.student_id,
      subject_id: c.subject_id,
      name: c.subject_name || 'Class',
      description: c.description,
      subject: c.subject_name,
      subject_name: c.subject_name,
      grade_level: c.grade_level,
      start_date: c.start_date,
      end_date: c.end_date,
      status: c.status,
      tutor_name: c.tutor_name,
      student_name: c.student_name,
      sessions_per_week: c.sessions_per_week
    }));

    return res.status(200).json({
      success: true,
      message: 'Active classes retrieved successfully',
      data: transformed
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve active classes',
      error: error.message
    } as ApiResponse);
  }
};
