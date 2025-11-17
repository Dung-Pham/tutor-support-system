/**
 * File: services/attendanceService.ts
 * Purpose: API service for Attendance operations
 * API Endpoints: Based on backend /api/attendance endpoints (already exists)
 * Usage: Import and call methods from components/Redux thunks
 */

import { apiClient } from './api';
import type {
  AttendanceRecord,
  ConfirmAttendanceDTO,
  AttendanceStats,
  AttendanceHistoryResponse,
  AttendanceStatsResponse,
} from '../types/attendance';

/**
 * Get or create attendance for a schedule
 * @param scheduleId - Schedule UUID
 */
export const getOrCreateAttendance = async (scheduleId: string): Promise<{ success: boolean; data: AttendanceRecord }> => {
  const response = await apiClient.get<{ success: boolean; data: AttendanceRecord }>(
    `/attendance/schedule/${scheduleId}`
  );
  return response.data;
};

/**
 * Get attendance history for a user
 * @param userId - User UUID
 * @param params - Query parameters (role, page, limit)
 */
export const getAttendanceHistory = async (
  userId: string,
  params: {
    role: 'user' | 'tutor';
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
 * @param role - User role (user or tutor)
 */
export const getAttendanceStats = async (
  userId: string,
  role: 'user' | 'tutor'
): Promise<AttendanceStatsResponse> => {
  const response = await apiClient.get<AttendanceStatsResponse>(
    `/attendance/user/${userId}/stats`,
    { params: { role } }
  );
  return response.data;
};

/**
 * Get pending confirmations for a class
 * @param classId - Class UUID
 */
export const getPendingConfirmations = async (
  classId: string
): Promise<AttendanceHistoryResponse> => {
  const response = await apiClient.get<AttendanceHistoryResponse>('/attendance/pending', {
    params: { classId },
  });
  return response.data;
};

/**
 * Confirm attendance (user or tutor)
 * @param attendanceId - Attendance UUID
 * @param data - Confirmation data (confirmedBy, notes)
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
