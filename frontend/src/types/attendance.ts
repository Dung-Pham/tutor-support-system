/**
 * File: types/attendance.ts
 * Purpose: Type definitions for Attendance domain
 * API Alignment: Matches backend /api/attendance endpoints
 */

export type AttendanceStatus = 'pending' | 'confirmed_by_user' | 'confirmed_by_tutor' | 'confirmed' | 'absent';

export interface AttendanceRecord {
  attendance_id: string; // UUID
  schedule_id: string;
  class_id: string;
  student_id: string;
  tutor_id: string;
  session_date: string; // ISO 8601
  status: AttendanceStatus;
  confirmed_by_user_at?: string;
  confirmed_by_tutor_at?: string;
  user_notes?: string;
  tutor_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ConfirmAttendanceDTO {
  confirmedBy: 'user' | 'tutor';
  notes?: string;
}

export interface AttendanceStats {
  total_sessions: number;
  attended: number;
  absent: number;
  pending: number;
  attendance_rate: number; // Percentage
}

export interface AttendanceHistoryResponse {
  success: boolean;
  data: AttendanceRecord[];
  count?: number;
  page?: number;
  limit?: number;
}

export interface AttendanceStatsResponse {
  success: boolean;
  data: AttendanceStats;
}
