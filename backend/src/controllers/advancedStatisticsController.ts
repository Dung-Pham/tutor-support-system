/**
 * File: controllers/advancedStatisticsController.ts
 * Purpose: Advanced Controller for Tutor Statistics Dashboard with filters
 * Description: Handles KPIs, charts data, and widgets with time/class filters
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { StatisticsFilters, TimeFilterType } from '../types/statistics.types';
import * as advancedStats from '../database/queries/advancedStatisticsQueries';

/**
 * Parse filters from query params
 */
function parseFilters(query: any): StatisticsFilters {
  const timeFilter = (query.timeFilter as TimeFilterType) || 'this_month';
  return {
    timeFilter,
    fromDate: query.fromDate as string,
    toDate: query.toDate as string,
    classId: query.classId as string || 'all',
  };
}

/**
 * Validate tutor access
 */
function validateTutorAccess(req: AuthenticatedRequest): { valid: boolean; tutorId?: string; error?: { status: number; message: string } } {
  const tutorId = req.user?.userId;
  const userRole = req.user?.role?.toUpperCase();

  if (!tutorId) {
    return { valid: false, error: { status: 401, message: 'Unauthorized' } };
  }

  if (userRole !== 'TUTOR') {
    return { valid: false, error: { status: 403, message: 'Chỉ gia sư mới có thể xem thống kê' } };
  }

  return { valid: true, tutorId };
}

/**
 * Get KPI overview with filters
 * @route GET /api/statistics/v2/overview
 */
export const getAdvancedOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validation = validateTutorAccess(req);
    
    if (!validation.valid) {
      return res.status(validation.error!.status).json({ message: validation.error!.message });
    }

    const filters = parseFilters(req.query);
    const overview = await advancedStats.getStatisticsOverview(validation.tutorId!, filters);

    return res.json({
      success: true,
      data: overview,
      filters,
    });
  } catch (error) {
    console.error('Error getting advanced overview:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê tổng quan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get sessions & revenue over time (for chart)
 * @route GET /api/statistics/v2/sessions-over-time
 */
export const getSessionsOverTime = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validation = validateTutorAccess(req);
    if (!validation.valid) {
      return res.status(validation.error!.status).json({ message: validation.error!.message });
    }

    const filters = parseFilters(req.query);
    const result = await advancedStats.getSessionsRevenueOverTime(validation.tutorId!, filters);

    return res.json({
      success: true,
      data: result.data,
      periodType: result.periodType,
      currency: 'VND',
      filters,
    });
  } catch (error) {
    console.error('Error getting sessions over time:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu buổi học theo thời gian',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get time distribution by class (for pie chart)
 * @route GET /api/statistics/v2/time-distribution
 */
export const getTimeDistribution = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validation = validateTutorAccess(req);
    if (!validation.valid) {
      return res.status(validation.error!.status).json({ message: validation.error!.message });
    }

    const filters = parseFilters(req.query);
    const result = await advancedStats.getTimeDistribution(validation.tutorId!, filters);

    return res.json({
      success: true,
      data: result.data,
      totalHours: result.totalHours,
      totalRevenue: result.totalRevenue,
      totalSessions: result.totalSessions,
      filters,
    });
  } catch (error) {
    console.error('Error getting time distribution:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy phân bổ thời gian',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get learning effectiveness by class (for stacked bar chart)
 * @route GET /api/statistics/v2/learning-effectiveness
 */
export const getLearningEffectiveness = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validation = validateTutorAccess(req);
    if (!validation.valid) {
      return res.status(validation.error!.status).json({ message: validation.error!.message });
    }

    const filters = parseFilters(req.query);
    const result = await advancedStats.getLearningEffectiveness(validation.tutorId!, filters);

    return res.json({
      success: true,
      data: result.data,
      overallOnTimePercent: result.overallStats.overallOnTimePercent,
      overallLatePercent: result.overallStats.overallLatePercent,
      overallMissingPercent: result.overallStats.overallMissingPercent,
      overallAverageScore: result.overallStats.overallAverageScore,
      filters,
    });
  } catch (error) {
    console.error('Error getting learning effectiveness:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy hiệu quả học tập',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get student ranking based on average homework score
 * @route GET /api/statistics/v2/student-ranking
 */
export const getStudentRanking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validation = validateTutorAccess(req);
    if (!validation.valid) {
      return res.status(validation.error!.status).json({ message: validation.error!.message });
    }

    const filters = parseFilters(req.query);
    const ranking = await advancedStats.getStudentRanking(validation.tutorId!, filters);

    return res.json({
      success: true,
      data: ranking,
      totalStudents: ranking.length,
      filters,
    });
  } catch (error) {
    console.error('Error getting student ranking:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy bảng xếp hạng học sinh',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get class options for filter dropdown
 * @route GET /api/statistics/v2/classes
 */
export const getClassOptions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validation = validateTutorAccess(req);
    if (!validation.valid) {
      return res.status(validation.error!.status).json({ message: validation.error!.message });
    }

    const classes = await advancedStats.getTutorClasses(validation.tutorId!);

    return res.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error('Error getting class options:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lớp',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all statistics data at once
 * @route GET /api/statistics/v2/all
 */
export const getAllAdvancedStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validation = validateTutorAccess(req);
    
    if (!validation.valid) {
      return res.status(validation.error!.status).json({ message: validation.error!.message });
    }

    const filters = parseFilters(req.query);
    const tutorId = validation.tutorId!;

    // Fetch all data in parallel
    const [
      overview,
      sessionsOverTime,
      timeDistribution,
      studentRanking,
      classes,
    ] = await Promise.all([
      advancedStats.getStatisticsOverview(tutorId, filters),
      advancedStats.getSessionsRevenueOverTime(tutorId, filters),
      advancedStats.getTimeDistribution(tutorId, filters),
      advancedStats.getStudentRanking(tutorId, filters),
      advancedStats.getTutorClasses(tutorId),
    ]);

    return res.json({
      success: true,
      data: {
        overview,
        sessionsOverTime: {
          data: sessionsOverTime.data,
          periodType: sessionsOverTime.periodType,
          currency: 'VND',
        },
        timeDistribution: {
          data: timeDistribution.data,
          totalHours: timeDistribution.totalHours,
          totalRevenue: timeDistribution.totalRevenue,
          totalSessions: timeDistribution.totalSessions,
        },
        studentRanking: {
          data: studentRanking,
          totalStudents: studentRanking.length,
        },
        classes,
      },
      filters,
    });
  } catch (error) {
    console.error('Error getting all statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy toàn bộ thống kê',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
