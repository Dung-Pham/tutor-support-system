/**
 * File: controllers/scheduleController.ts
 * Mục đích: Handle HTTP requests cho schedule management
 * Vai trò: Validate input, call service layer, format responses
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest, ApiResponse } from '../types';
import * as scheduleService from '../services/scheduleService';

/**
 * Create new schedule
 * POST /api/schedules
 */
export const createSchedule = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: errors.array()
      } as ApiResponse);
    }
    
    const schedules = await scheduleService.createSchedule(req.body);
    
    return res.status(201).json({
      success: true,
      message: 'Schedules created successfully',
      data: schedules
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create schedules',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get schedule by ID
 * GET /api/schedules/:scheduleId
 */
export const getSchedule = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const scheduleId = req.params.scheduleId; // UUID string
    const schedule = await scheduleService.getScheduleById(scheduleId);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      } as ApiResponse);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Schedule retrieved successfully',
      data: schedule
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve schedule',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Update schedule
 * PUT /api/schedules/:scheduleId
 */
export const updateSchedule = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: errors.array()
      } as ApiResponse);
    }
    
    const scheduleId = req.params.scheduleId; // UUID string
    const schedule = await scheduleService.updateSchedule(scheduleId, req.body);
    
    return res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Delete schedule
 * DELETE /api/schedules/:scheduleId
 */
export const deleteSchedule = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const scheduleId = req.params.scheduleId; // UUID string
    await scheduleService.deleteSchedule(scheduleId);
    
    return res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete schedule',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get calendar view (simplified - just get schedules for date range)
 * GET /api/schedules/calendar
 */
export const getCalendarView = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.query.userId as string;
    const userRole = req.query.userRole as 'tutor' | 'student';
    
    let schedules;
    if (userRole === 'tutor') {
      schedules = await scheduleService.getSchedulesByTutor(userId);
    } else {
      schedules = await scheduleService.getSchedulesByStudent(userId);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Calendar view retrieved successfully',
      data: schedules
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve calendar view',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get schedules with filters and pagination
 * GET /api/schedules
 */
export const getSchedules = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const filters = {
      tutor_id: req.query.tutorId as string | undefined,
      student_id: req.query.studentId as string | undefined,
      class_id: req.query.classId as string | undefined,
      status: req.query.status as string | undefined
    };
    
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const result = await scheduleService.getSchedules(filters, page, limit);
    
    return res.status(200).json({
      success: true,
      message: 'Schedules retrieved successfully',
      data: result
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve schedules',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get schedules for a specific week
 * GET /api/schedules/week/:weekStartDate
 * Returns schedule instances with their actual session dates for the given week
 */
export const getWeekSchedules = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const weekStartDate = req.params.weekStartDate; // Format: YYYY-MM-DD
    const userId = req.query.userId as string;
    const role = req.query.role as 'tutor' | 'student';

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'userId and role are required query parameters'
      } as ApiResponse);
    }

    // Parse the week start date as LOCAL date (not UTC)
    // weekStartDate is "YYYY-MM-DD" format, parse it as local date
    const [year, month, day] = weekStartDate.split('-').map(Number);
    const startDate = new Date(year, month - 1, day); // Local date
    
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      } as ApiResponse);
    }

    // Get schedule instances for the week
    const instances = await scheduleService.getScheduleInstancesForWeek(userId, role, startDate);

    // Helper to format date as YYYY-MM-DD using local timezone
    const toLocalDateString = (date: Date): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    // Transform to response format
    const sessions = instances.map(({ schedule, sessionDate }) => ({
      schedule_id: schedule.schedule_id,
      class_id: schedule.class_id,
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      duration_minutes: schedule.duration_minutes,
      is_active: schedule.is_active,
      session_date: toLocalDateString(sessionDate), // Use local date format
      class_name: schedule.class_name,
      subject_name: schedule.subject_name,
      tutor_name: schedule.tutor_name,
      student_name: schedule.student_name,
      tutor_id: schedule.tutor_id,
      student_id: schedule.student_id
    }));

    return res.status(200).json({
      success: true,
      message: 'Week schedules retrieved successfully',
      data: {
        weekStartDate,
        sessions
      }
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error in getWeekSchedules:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve week schedules',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get weekly schedule template
 * GET /api/schedules/template/weekly
 * Returns raw schedule templates without specific dates
 */
export const getWeeklyTemplate = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role as 'tutor' | 'student';

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
    }

    let schedules;
    if (userRole === 'tutor') {
      schedules = await scheduleService.getSchedulesByTutor(userId);
    } else {
      schedules = await scheduleService.getSchedulesByStudent(userId);
    }

    return res.status(200).json({
      success: true,
      message: 'Weekly template retrieved successfully',
      data: schedules
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve weekly template',
      error: error.message
    } as ApiResponse);
  }
};

// Note: TimeBlock functionality has been removed in favor of Schedule-based approach
// The Schedule table now handles recurring time slots with day_of_week, start_time, end_time

/**
 * Get schedule instances for a specific week
 * GET /api/schedules/week/:weekStartDate
 * Returns actual session dates for the given week, filtered by class dates
 */
export const getSessionsByWeek = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { weekStartDate } = req.params;
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'userId and role are required'
      } as ApiResponse);
    }

    const weekStart = new Date(weekStartDate);
    const instances = await scheduleService.getScheduleInstancesForWeek(
      userId as string,
      role as 'tutor' | 'student',
      weekStart
    );

    return res.status(200).json({
      success: true,
      message: 'Schedule instances retrieved successfully',
      data: {
        weekStartDate: weekStartDate,
        sessions: instances
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve schedule instances',
      error: error.message
    } as ApiResponse);
  }
};
