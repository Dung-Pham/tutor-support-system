/**
 * File: controllers/scheduleController.ts
 * Mục đích: Handle HTTP requests cho schedule management
 * Vai trò: Validate input, call service layer, format responses
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest, ApiResponse, CalendarViewParams } from '../types';
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
    
    const schedule = await scheduleService.createSchedule(req.body);
    
    return res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: schedule
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create schedule',
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
 * Get calendar view
 * GET /api/schedules/calendar
 */
export const getCalendarView = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: errors.array()
      } as ApiResponse);
    }
    
    const params: CalendarViewParams = {
      userId: req.query.userId as string, // UUID string
      userRole: req.query.userRole as 'tutor' | 'user', // Changed from 'student' | 'parent'
      viewType: req.query.viewType as 'day' | 'week' | 'month',
      date: new Date(req.query.date as string)
    };
    
    const schedules = await scheduleService.getCalendarView(
      params.userId,
      params.userRole as 'tutor' | 'user', // Changed from 'student'
      params.date,
      params.date // For now, use same date for start and end
    );
    
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

// ============ TimeBlock Controllers ============

/**
 * Create timeblock
 * POST /api/schedules/timeblocks
 */
export const createTimeBlock = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: errors.array()
      } as ApiResponse);
    }
    
    const timeBlock = await scheduleService.createTimeBlock(req.body);
    
    return res.status(201).json({
      success: true,
      message: 'TimeBlock created successfully',
      data: timeBlock
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create timeblock',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get timeblocks by tutor
 * GET /api/schedules/timeblocks/tutor/:tutorId
 */
export const getTimeBlocksByTutor = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const tutorId = req.params.tutorId; // UUID string
    const timeBlocks = await scheduleService.getTimeBlocksByTutor(tutorId);
    
    return res.status(200).json({
      success: true,
      message: 'TimeBlocks retrieved successfully',
      data: timeBlocks
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve timeblocks',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Update timeblock status
 * PATCH /api/schedules/timeblocks/:timeBlockId/status
 */
export const updateTimeBlockStatus = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const timeBlockId = req.params.timeBlockId; // UUID string
    const { isAvailable, reason } = req.body;
    
    const timeBlock = await scheduleService.updateTimeBlockStatus(timeBlockId, isAvailable, reason);
    
    return res.status(200).json({
      success: true,
      message: 'TimeBlock status updated successfully',
      data: timeBlock
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update timeblock status',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Delete timeblock
 * DELETE /api/schedules/timeblocks/:timeBlockId
 */
export const deleteTimeBlock = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const timeBlockId = req.params.timeBlockId; // UUID string
    await scheduleService.deleteTimeBlock(timeBlockId);
    
    return res.status(200).json({
      success: true,
      message: 'TimeBlock deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete timeblock',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get available timeblocks
 * GET /api/schedules/timeblocks/available
 */
export const getAvailableTimeBlocks = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const tutorId = req.query.tutorId as string; // UUID string
    const date = new Date(req.query.date as string);
    
    const timeBlocks = await scheduleService.getAvailableTimeBlocks(tutorId, date);
    
    return res.status(200).json({
      success: true,
      message: 'Available timeblocks retrieved successfully',
      data: timeBlocks
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve available timeblocks',
      error: error.message
    } as ApiResponse);
  }
};
