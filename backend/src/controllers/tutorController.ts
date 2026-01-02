/**
 * File: controllers/tutorController.ts
 * Purpose: Controller for Tutor management (Student's tutors)
 * Routes:
 *   GET /api/tutors/my-tutors - Get all tutors of current student
 *   GET /api/tutors/my-tutors/:tutorId - Get single tutor detail
 *   GET /api/tutors/my-tutors/search?q=... - Search tutors
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import * as tutorQueries from '../database/queries/tutorQueries';

/**
 * Get all tutors of current student
 * @route GET /api/tutors/my-tutors
 */
export const getMyTutors = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'STUDENT') {
      return res.status(403).json({ message: 'Chỉ học sinh mới có thể xem danh sách gia sư' });
    }

    const tutors = await tutorQueries.getStudentTutors(studentId);

    return res.json({
      success: true,
      data: tutors,
      count: tutors.length
    });
  } catch (error) {
    console.error('Error getting tutors:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy danh sách gia sư',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get single tutor detail
 * @route GET /api/tutors/my-tutors/:tutorId
 */
export const getTutorById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();
    const { tutorId } = req.params;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'STUDENT') {
      return res.status(403).json({ message: 'Chỉ học sinh mới có thể xem thông tin gia sư' });
    }

    const tutor = await tutorQueries.getStudentTutorById(studentId, tutorId);

    if (!tutor) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy gia sư này' 
      });
    }

    return res.json({
      success: true,
      data: tutor
    });
  } catch (error) {
    console.error('Error getting tutor:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy thông tin gia sư',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Search tutors by name or email
 * @route GET /api/tutors/my-tutors/search?q=...
 */
export const searchTutors = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();
    const searchTerm = req.query.q as string;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'STUDENT') {
      return res.status(403).json({ message: 'Chỉ học sinh mới có thể tìm kiếm gia sư' });
    }

    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm' 
      });
    }

    const tutors = await tutorQueries.searchStudentTutors(studentId, searchTerm);

    return res.json({
      success: true,
      data: tutors,
      count: tutors.length
    });
  } catch (error) {
    console.error('Error searching tutors:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi tìm kiếm gia sư',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
