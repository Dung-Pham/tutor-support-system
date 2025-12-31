/**
 * File: controllers/attendanceController.ts
 * Purpose: Handle HTTP requests for attendance management
 * Updated for new schema: session_date, student_confirmed
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest, ApiResponse } from '../types';
import * as attendanceService from '../services/attendanceService';

/**
 * Get or create attendance for a schedule on specific date
 * GET /api/attendance/session/:scheduleId/:sessionDate
 */
export const getOrCreateAttendance = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { scheduleId, sessionDate } = req.params; // scheduleId: UUID, sessionDate: YYYY-MM-DD
    const attendance = await attendanceService.getOrCreateAttendance(scheduleId, sessionDate);
    return res.status(200).json({ 
      success: true, 
      message: 'Attendance retrieved', 
      data: attendance 
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get attendance', 
      error: error.message 
    } as ApiResponse);
  }
};

export const updateAttendance = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }
    
    const attendanceId = req.params.attendanceId; // UUID string
    const attendance = await attendanceService.updateAttendance(attendanceId, req.body);
    return res.status(200).json({ success: true, message: 'Attendance updated', data: attendance } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update attendance', error: error.message } as ApiResponse);
  }
};

/**
 * Confirm attendance by tutor or student
 * POST /api/attendance/:attendanceId/confirm
 */
export const confirmAttendance = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }
    
    const attendanceId = req.params.attendanceId; // UUID string
    const { confirmedBy, notes } = req.body; // confirmedBy: 'tutor' | 'student'
    const attendance = await attendanceService.confirmAttendance(attendanceId, confirmedBy, notes);
    return res.status(200).json({ success: true, message: 'Attendance confirmed', data: attendance } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to confirm attendance', error: error.message } as ApiResponse);
  }
};

export const getAttendanceHistory = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.params.userId; // UUID string
    const role = req.query.role as 'tutor' | 'student' || 'student';
    const classId = req.query.classId as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const result = await attendanceService.getAttendanceHistory(userId, role, classId, page, limit);
    return res.status(200).json({ success: true, message: 'Attendance history retrieved', data: result } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get attendance history', error: error.message } as ApiResponse);
  }
};

export const getAttendanceStats = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.params.userId; // UUID string
    const role = req.query.role as 'tutor' | 'student' || 'student';
    const classId = req.query.classId as string | undefined;
    
    const stats = await attendanceService.getAttendanceStats(userId, role, classId);
    return res.status(200).json({ success: true, message: 'Attendance stats retrieved', data: stats } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get attendance stats', error: error.message } as ApiResponse);
  }
};

export const getPendingConfirmations = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const classId = req.query.classId as string; // UUID - need class_id parameter
    const confirmations = await attendanceService.getPendingConfirmations(classId);
    return res.status(200).json({ success: true, message: 'Pending confirmations retrieved', data: confirmations } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get pending confirmations', error: error.message } as ApiResponse);
  }
};
