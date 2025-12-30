/**
 * File: controllers/statisticsController.ts
 * Purpose: Controller for Tutor Statistics Dashboard
 * Routes:
 *   GET /api/statistics/overview - Get overview stats
 *   GET /api/statistics/classes - Get classes with progress
 *   GET /api/statistics/upcoming - Get upcoming homework deadlines
 *   GET /api/statistics/submissions - Get recent submissions
 *   GET /api/statistics/students - Get student activities
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import * as statsQueries from '../database/queries/tutorStatisticsQueries';

/**
 * Get overview statistics
 * @route GET /api/statistics/overview
 */
export const getOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();

    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'TUTOR') {
      return res.status(403).json({ message: 'Chỉ gia sư mới có thể xem thống kê' });
    }

    const overview = await statsQueries.getTutorOverview(tutorId);

    return res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Error getting overview:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy thống kê tổng quan',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get classes with progress
 * @route GET /api/statistics/classes
 */
export const getClassesProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();

    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'TUTOR') {
      return res.status(403).json({ message: 'Chỉ gia sư mới có thể xem thống kê' });
    }

    const classes = await statsQueries.getClassesWithProgress(tutorId);

    return res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error getting classes progress:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy tiến độ lớp học',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get upcoming homework deadlines
 * @route GET /api/statistics/upcoming
 */
export const getUpcomingHomeworks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();
    const limit = parseInt(req.query.limit as string) || 5;

    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'TUTOR') {
      return res.status(403).json({ message: 'Chỉ gia sư mới có thể xem thống kê' });
    }

    const homeworks = await statsQueries.getUpcomingHomeworks(tutorId, limit);

    return res.json({
      success: true,
      data: homeworks
    });
  } catch (error) {
    console.error('Error getting upcoming homeworks:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy bài tập sắp đến hạn',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get recent submissions
 * @route GET /api/statistics/submissions
 */
export const getRecentSubmissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();
    const limit = parseInt(req.query.limit as string) || 10;

    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'TUTOR') {
      return res.status(403).json({ message: 'Chỉ gia sư mới có thể xem thống kê' });
    }

    const submissions = await statsQueries.getRecentSubmissions(tutorId, limit);

    return res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error getting recent submissions:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy bài nộp gần đây',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get student activities
 * @route GET /api/statistics/students
 */
export const getStudentActivities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();

    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'TUTOR') {
      return res.status(403).json({ message: 'Chỉ gia sư mới có thể xem thống kê' });
    }

    const students = await statsQueries.getStudentActivities(tutorId);

    return res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error getting student activities:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy hoạt động học sinh',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all statistics in one call
 * @route GET /api/statistics/all
 */
export const getAllStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();

    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole !== 'TUTOR') {
      return res.status(403).json({ message: 'Chỉ gia sư mới có thể xem thống kê' });
    }

    // Fetch all data in parallel
    const [overview, classes, upcoming, submissions, students] = await Promise.all([
      statsQueries.getTutorOverview(tutorId),
      statsQueries.getClassesWithProgress(tutorId),
      statsQueries.getUpcomingHomeworks(tutorId, 5),
      statsQueries.getRecentSubmissions(tutorId, 10),
      statsQueries.getStudentActivities(tutorId),
    ]);

    return res.json({
      success: true,
      data: {
        overview,
        classes,
        upcoming,
        submissions,
        students,
      }
    });
  } catch (error) {
    console.error('Error getting all statistics:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
