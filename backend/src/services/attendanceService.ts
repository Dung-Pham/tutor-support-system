/**
 * File: services/attendanceService.ts
 * Purpose: Business logic for attendance management
 * Updated to match new schema: session_date, student_confirmed
 */

import * as attendanceQueries from '../database/queries/attendanceQueries';
import {
  AttendanceRecord,
  CreateAttendanceDTO,
  ConfirmAttendanceDTO
} from '../database/queries/attendanceQueries';

/**
 * Get or create attendance record for a schedule on specific date
 */
export const getOrCreateAttendance = async (
  scheduleId: string,
  sessionDate: string // YYYY-MM-DD
): Promise<AttendanceRecord> => {
  return await attendanceQueries.getOrCreateAttendance(scheduleId, sessionDate);
};

/**
 * Confirm attendance (tutor or student)
 */
export const confirmAttendance = async (
  attendanceId: string,
  confirmedBy: 'tutor' | 'student',
  notes?: string
): Promise<AttendanceRecord> => {
  const attendance = await attendanceQueries.getAttendanceById(attendanceId);

  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  // Check if already confirmed
  if (confirmedBy === 'tutor' && attendance.tutor_confirmed) {
    throw new Error('Attendance already confirmed by tutor');
  }

  if (confirmedBy === 'student' && attendance.student_confirmed) {
    throw new Error('Attendance already confirmed by student');
  }

  return await attendanceQueries.confirmAttendance(attendanceId, confirmedBy, notes);
};

/**
 * Update attendance record
 */
export const updateAttendance = async (
  attendanceId: string,
  data: {
    status?: string;
  }
): Promise<AttendanceRecord> => {
  const attendance = await attendanceQueries.getAttendanceById(attendanceId);

  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  if (data.status) {
    return await attendanceQueries.updateAttendanceStatus(attendanceId, data.status);
  }

  return attendance;
};

/**
 * Get attendance by ID
 */
export const getAttendanceById = async (attendanceId: string): Promise<AttendanceRecord | null> => {
  return await attendanceQueries.getAttendanceById(attendanceId);
};

/**
 * Get attendance history for a user
 */
export const getAttendanceHistory = async (
  userId: string,
  role: 'tutor' | 'student',
  classId?: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  records: AttendanceRecord[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const offset = (page - 1) * limit;

  const result = await attendanceQueries.getAttendanceByUser({
    user_id: userId,
    role,
    class_id: classId,
    limit,
    offset,
  });

  return {
    records: result.records,
    total: result.total,
    page,
    totalPages: Math.ceil(result.total / limit),
  };
};

/**
 * Get attendance statistics for a user
 */
export const getAttendanceStats = async (
  userId: string,
  role: 'tutor' | 'student',
  classId?: string
): Promise<{
  total_sessions: number;
  confirmed_sessions: number;
  pending_sessions: number;
  absent_sessions: number;
  confirmation_rate: number;
}> => {
  return await attendanceQueries.getAttendanceStatistics(userId, role, classId);
};

/**
 * Get pending confirmations
 */
export const getPendingConfirmations = async (
  classId: string,
  limit?: number
): Promise<AttendanceRecord[]> => {
  return await attendanceQueries.getPendingConfirmations(classId, limit);
};

/**
 * Delete attendance record
 */
export const deleteAttendance = async (attendanceId: string): Promise<boolean> => {
  const attendance = await attendanceQueries.getAttendanceById(attendanceId);

  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  return await attendanceQueries.deleteAttendance(attendanceId);
};
