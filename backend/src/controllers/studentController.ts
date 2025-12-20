/**
 * File: controllers/studentController.ts
 * Purpose: Controller for Student management (Tutor's students)
 * Routes:
 *   GET /api/students - Get all students of current tutor
 *   GET /api/students/:studentId - Get single student detail
 *   GET /api/students/search?q=... - Search students
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import * as studentQueries from '../database/queries/studentQueries';

/**
 * Get all students of current tutor
 * @route GET /api/students
 */
export const getMyStudents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();

    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'TUTOR') {
      return res.status(403).json({ message: 'Chỉ gia sư mới có thể xem danh sách học sinh' });
    }

    const students = await studentQueries.getTutorStudents(tutorId);

    return res.json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error) {
    console.error('Error getting students:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy danh sách học sinh',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get single student detail
 * @route GET /api/students/:studentId
 */
export const getStudentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();
    const { studentId } = req.params;

    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'TUTOR') {
      return res.status(403).json({ message: 'Chỉ gia sư mới có thể xem thông tin học sinh' });
    }

    const student = await studentQueries.getTutorStudentById(tutorId, studentId);

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy học sinh này' 
      });
    }

    return res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error getting student:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy thông tin học sinh',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Search students by name or email
 * @route GET /api/students/search?q=...
 */
export const searchStudents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();
    const searchTerm = req.query.q as string;

    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'TUTOR') {
      return res.status(403).json({ message: 'Chỉ gia sư mới có thể tìm kiếm học sinh' });
    }

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' 
      });
    }

    const students = await studentQueries.searchTutorStudents(tutorId, searchTerm.trim());

    return res.json({
      success: true,
      data: students,
      count: students.length,
      searchTerm
    });
  } catch (error) {
    console.error('Error searching students:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi tìm kiếm học sinh',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
