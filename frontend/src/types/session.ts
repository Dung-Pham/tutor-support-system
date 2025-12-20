/**
 * File: types/session.ts
 * Purpose: Type definitions for Schedule domain (Weekly Recurring Template)
 * API Alignment: Matches backend /api/schedules endpoints
 * 
 * Schema: Schedule is a weekly recurring template, NOT a specific date session
 * - day_of_week: 0 (Sunday) - 6 (Saturday)
 * - start_time, end_time: TIME format (HH:mm:ss)
 * - is_active: Whether this schedule slot is active
 */

// Day of week constants
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const DAY_NAMES = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

// Schedule Template - Weekly recurring schedule
export interface Schedule {
  schedule_id: string;
  class_id: string;
  day_of_week: DayOfWeek; // 0-6 (Sunday-Saturday)
  start_time: string | Date; // TIME format: HH:mm:ss or Date object
  end_time: string | Date; // TIME format: HH:mm:ss or Date object
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  class_name?: string;
  subject_name?: string;
  tutor_id?: string;
  tutor_name?: string;
  student_id?: string;
  student_name?: string;
}

// Session instance - A specific occurrence of a Schedule on a date
export interface SessionInstance {
  schedule_id: string;
  session_date: string; // YYYY-MM-DD format
  class_id: string;
  day_of_week: DayOfWeek;
  start_time: string | Date;
  end_time: string | Date;
  is_active: boolean;
  // Joined fields
  class_name?: string;
  subject_name?: string;
  tutor_id?: string;
  tutor_name?: string;
  student_id?: string;
  student_name?: string;
  // Attendance info (if joined)
  attendance_id?: string;
  status?: 'present' | 'absent' | 'late';
  tutor_confirmed?: boolean;
  student_confirmed?: boolean;
}

export interface CreateScheduleDTO {
  class_id: string;
  days_of_week: DayOfWeek[];
  start_time: string; // HH:mm or HH:mm:ss
  end_time: string;
  is_active?: boolean;
}

export interface UpdateScheduleDTO {
  day_of_week?: DayOfWeek;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

export interface SchedulesListResponse {
  success: boolean;
  data: Schedule[];
  count?: number;
}

export interface ScheduleDetailResponse {
  success: boolean;
  data: Schedule;
}

// Weekly sessions response - sessions for a specific week
export interface WeeklySessionsResponse {
  success: boolean;
  message: string;
  data: {
    weekStartDate: string;
    sessions: SessionInstance[];
  };
}

// Date sessions response - sessions for a specific date
export interface DateSessionsResponse {
  success: boolean;
  data: SessionInstance[];
  date: string;
}

// Utility functions
export function getDayName(dayOfWeek: DayOfWeek): string {
  return DAY_NAMES[dayOfWeek];
}

export function formatTimeRange(startTime: string, endTime: string): string {
  const start = startTime.slice(0, 5); // HH:mm
  const end = endTime.slice(0, 5);
  return `${start} - ${end}`;
}

// Legacy alias for backward compatibility
export type Session = Schedule;
export type SessionStatus = 'present' | 'absent' | 'late';
export interface SessionsListResponse {
  success: boolean;
  data: Schedule[];
  count?: number;
  page?: number;
  limit?: number;
}
export interface SessionDetailResponse {
  success: boolean;
  data: Schedule;
}
