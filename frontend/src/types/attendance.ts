/**
 * File: types/attendance.ts
 * Purpose: Type definitions for Attendance domain
 * API Alignment: Matches backend /api/attendance endpoints
 * Schema: Matches tutorsupportdb_merged-v2.sql
 */

export type AttendanceOverallStatus = 'PENDING' | 'CONFIRMED' | 'ABSENT' | 'CANCELLED';

export interface AttendanceRecord {
  attendance_id: string;
  class_id: string;
  schedule_id: string;
  session_date: string; // YYYY-MM-DD format
  tutor_confirmed: boolean;
  tutor_confirmed_at?: string;
  tutor_notes?: string;
  student_confirmed: boolean;
  student_confirmed_at?: string;
  student_notes?: string;
  overall_status: AttendanceOverallStatus;
  created_at: string;
  updated_at?: string;
  // Joined fields
  tutor_name?: string;
  student_name?: string;
  subject_name?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
}

export interface CreateAttendanceDTO {
  class_id: string;
  schedule_id: string;
  session_date: string;
}

export interface ConfirmAttendanceDTO {
  confirmedBy: 'tutor' | 'student';
  notes?: string;
}

export interface UpdateAttendanceDTO {
  overall_status?: AttendanceOverallStatus;
  tutor_notes?: string;
  student_notes?: string;
}

export interface AttendanceStats {
  total_sessions: number;
  confirmed_sessions: number;
  pending_sessions: number;
  absent_sessions: number;
  confirmation_rate: number; // Percentage
}

export interface AttendanceHistoryResponse {
  success: boolean;
  data: {
    records: AttendanceRecord[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface AttendanceStatsResponse {
  success: boolean;
  data: AttendanceStats;
}

export interface MonthlyAttendanceSummary {
  month: string; // YYYY-MM
  total: number;
  confirmed: number;
  pending: number;
  absent: number;
}
