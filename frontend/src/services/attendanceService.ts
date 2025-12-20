/**
 * File: services/attendanceService.ts
 * Purpose: API service for Attendance operations
 * API Endpoints: Based on backend /api/attendance endpoints
 * 
 * Schema: AttendanceRecord links Schedule + session_date
 * - schedule_id: FK to Schedule (weekly template)
 * - session_date: The specific date of this session instance
 * - tutor_confirmed, student_confirmed: Boolean confirmation flags
 */

import { apiClient } from './api';
import type {
  AttendanceRecord,
  ConfirmAttendanceDTO,
  CreateAttendanceDTO,
  UpdateAttendanceDTO,
  AttendanceHistoryResponse,
  AttendanceStatsResponse,
  MonthlyAttendanceSummary,
} from '../types/attendance';

// ============= CRUD OPERATIONS =============

/**
 * Get or create attendance for a schedule on a specific date
 * @param scheduleId - Schedule UUID
 * @param sessionDate - Date in YYYY-MM-DD format
 */
export const getOrCreateAttendance = async (
  scheduleId: string,
  sessionDate: string
): Promise<{ success: boolean; data: AttendanceRecord }> => {
  const response = await apiClient.get<{ success: boolean; data: AttendanceRecord }>(
    `/attendance/session/${scheduleId}/${sessionDate}`
  );
  return response.data;
};

/**
 * Create new attendance record
 * @param data - Attendance creation data
 */
export const createAttendance = async (
  data: CreateAttendanceDTO
): Promise<{ success: boolean; data: AttendanceRecord }> => {
  const response = await apiClient.post<{ success: boolean; data: AttendanceRecord }>(
    '/attendance',
    data
  );
  return response.data;
};

/**
 * Update attendance record
 * @param attendanceId - Attendance UUID
 * @param data - Update data
 */
export const updateAttendance = async (
  attendanceId: string,
  data: UpdateAttendanceDTO
): Promise<{ success: boolean; data: AttendanceRecord }> => {
  const response = await apiClient.put<{ success: boolean; data: AttendanceRecord }>(
    `/attendance/${attendanceId}`,
    data
  );
  return response.data;
};

// ============= HISTORY & STATS =============

/**
 * Get attendance history for a user
 * @param userId - User UUID
 * @param params - Query parameters (role: 'student' | 'tutor', page, limit)
 */
export const getAttendanceHistory = async (
  userId: string,
  params: {
    role: 'student' | 'tutor';
    page?: number;
    limit?: number;
  }
): Promise<AttendanceHistoryResponse> => {
  const response = await apiClient.get<AttendanceHistoryResponse>(
    `/attendance/user/${userId}/history`,
    { params }
  );
  return response.data;
};

/**
 * Get attendance statistics for a user
 * @param userId - User UUID
 * @param role - User role ('student' or 'tutor')
 */
export const getAttendanceStats = async (
  userId: string,
  role: 'student' | 'tutor'
): Promise<AttendanceStatsResponse> => {
  const response = await apiClient.get<AttendanceStatsResponse>(
    `/attendance/user/${userId}/stats`,
    { params: { role } }
  );
  return response.data;
};

/**
 * Get attendance for a specific class
 * @param classId - Class UUID
 * @param params - Query parameters
 */
export const getAttendanceByClass = async (
  classId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<AttendanceHistoryResponse> => {
  const response = await apiClient.get<AttendanceHistoryResponse>(
    `/attendance/class/${classId}`,
    { params }
  );
  return response.data;
};

/**
 * Get monthly attendance summary
 * @param userId - User UUID
 * @param year - Year (YYYY)
 * @param month - Month (1-12)
 */
export const getMonthlyAttendance = async (
  userId: string,
  year: number,
  month: number
): Promise<{ success: boolean; data: MonthlyAttendanceSummary }> => {
  const response = await apiClient.get<{ success: boolean; data: MonthlyAttendanceSummary }>(
    `/attendance/user/${userId}/monthly/${year}/${month}`
  );
  return response.data;
};

// ============= CONFIRMATION =============

/**
 * Get pending confirmations for a class
 * @param classId - Class UUID (optional)
 */
export const getPendingConfirmations = async (
  classId?: string
): Promise<AttendanceHistoryResponse> => {
  const params = classId ? { classId } : undefined;
  const response = await apiClient.get<AttendanceHistoryResponse>('/attendance/pending', {
    params,
  });
  return response.data;
};

/**
 * Confirm attendance (student or tutor)
 * @param attendanceId - Attendance UUID
 * @param data - Confirmation data (confirmedBy: 'student' | 'tutor', notes)
 */
export const confirmAttendance = async (
  attendanceId: string,
  data: ConfirmAttendanceDTO
): Promise<{ success: boolean; data: AttendanceRecord }> => {
  const response = await apiClient.post<{ success: boolean; data: AttendanceRecord }>(
    `/attendance/${attendanceId}/confirm`,
    data
  );
  return response.data;
};

/**
 * Mark attendance status (tutor only)
 * @param attendanceId - Attendance UUID
 * @param status - Overall status
 * @param notes - Optional notes
 */
export const markAttendanceStatus = async (
  attendanceId: string,
  status: 'PENDING' | 'CONFIRMED' | 'ABSENT' | 'CANCELLED',
  notes?: string
): Promise<{ success: boolean; data: AttendanceRecord }> => {
  const response = await apiClient.put<{ success: boolean; data: AttendanceRecord }>(
    `/attendance/${attendanceId}`,
    { overall_status: status, tutor_notes: notes }
  );
  return response.data;
};
