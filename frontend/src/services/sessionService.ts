/**
 * File: services/sessionService.ts
 * Purpose: API service for Schedule operations (Weekly Recurring Template)
 * API Endpoints: Based on backend /api/schedules
 * 
 * Schedule is a weekly recurring template, NOT a specific date session.
 * - Templates define day_of_week (0-6), start_time, end_time
 * - Use /schedules/date/:date or /schedules/week/:weekStartDate to get sessions
 */

import { apiClient } from './api';
import type {
  Schedule,
  SessionInstance,
  CreateScheduleDTO,
  UpdateScheduleDTO,
  SchedulesListResponse,
  ScheduleDetailResponse,
  WeeklySessionsResponse,
  DateSessionsResponse,
} from '../types/session';

// ============= SCHEDULE TEMPLATE CRUD =============

/**
 * Get all schedules for a class
 * @param classId - Class UUID
 */
export const getSchedulesByClass = async (classId: string): Promise<SchedulesListResponse> => {
  const response = await apiClient.get<SchedulesListResponse>(`/schedules/class/${classId}`);
  return response.data;
};

/**
 * Get schedule detail by ID
 * @param scheduleId - Schedule UUID
 */
export const getScheduleById = async (scheduleId: string): Promise<Schedule> => {
  const response = await apiClient.get<ScheduleDetailResponse>(`/schedules/${scheduleId}`);
  return response.data.data;
};

/**
 * Create new schedule template (Tutor only)
 * @param data - Schedule creation data (class_id, day_of_week, start_time, end_time)
 */
export const createSchedule = async (data: CreateScheduleDTO): Promise<Schedule[]> => {
  const response = await apiClient.post<SchedulesListResponse>('/schedules', data);
  return response.data.data;
};

/**
 * Update schedule template
 * @param scheduleId - Schedule UUID
 * @param data - Update payload
 */
export const updateSchedule = async (
  scheduleId: string,
  data: UpdateScheduleDTO
): Promise<Schedule> => {
  const response = await apiClient.put<ScheduleDetailResponse>(`/schedules/${scheduleId}`, data);
  return response.data.data;
};

/**
 * Delete schedule template
 * @param scheduleId - Schedule UUID
 */
export const deleteSchedule = async (scheduleId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/schedules/${scheduleId}`);
  return response.data;
};

// ============= SESSION INSTANCES (Specific Dates) =============

/**
 * Get all sessions for a specific date
 * Returns schedule templates that match the day_of_week of the given date
 * @param date - Date string in YYYY-MM-DD format
 * @param userId - Optional user ID filter
 * @param role - Optional role filter ('tutor' | 'student')
 */
export const getSessionsByDate = async (
  date: string,
  userId?: string,
  role?: 'tutor' | 'student'
): Promise<DateSessionsResponse> => {
  const params: Record<string, string> = {};
  if (userId) params.userId = userId;
  if (role) params.role = role;
  
  const response = await apiClient.get<DateSessionsResponse>(`/schedules/date/${date}`, { params });
  return response.data;
};

/**
 * Get all sessions for a week
 * @param weekStartDate - Monday date in YYYY-MM-DD format
 * @param userId - Optional user ID filter
 * @param role - Optional role filter
 */
export const getSessionsByWeek = async (
  weekStartDate: string,
  userId?: string,
  role?: 'tutor' | 'student'
): Promise<{ weekStartDate: string; sessions: SessionInstance[] }> => {
  const params: Record<string, string> = {};
  if (userId) params.userId = userId;
  if (role) params.role = role;
  
  const response = await apiClient.get<WeeklySessionsResponse>(
    `/schedules/week/${weekStartDate}`,
    { params }
  );
  return response.data.data;
};

/**
 * Get weekly template schedules for current user
 * This returns the raw schedule templates, grouped by day_of_week
 */
export const getWeeklyTemplate = async (): Promise<SchedulesListResponse> => {
  const response = await apiClient.get<SchedulesListResponse>('/schedules/template/weekly');
  return response.data;
};

/**
 * Get all schedules (for tutor to view all their schedules)
 */
export const getAllSchedules = async (): Promise<SchedulesListResponse> => {
  const response = await apiClient.get<SchedulesListResponse>('/schedules');
  return response.data;
};

// ============= CALENDAR VIEW HELPERS =============

/**
 * Get calendar view for current user
 * Combines schedules with attendance data for display
 * @param viewType - 'week' | 'month'
 * @param date - Reference date for the view
 */
export const getCalendarView = async (params: {
  viewType: 'week' | 'month';
  date: string; // YYYY-MM-DD
}): Promise<WeeklySessionsResponse> => {
  const response = await apiClient.get<WeeklySessionsResponse>('/schedules/calendar', { params });
  return response.data;
};

// ============= UTILITY FUNCTIONS =============

/**
 * Check if a schedule has session on a given date
 * @param schedule - Schedule template
 * @param date - Date to check
 */
export const hasSessionOnDate = (schedule: Schedule, date: Date): boolean => {
  return schedule.day_of_week === date.getDay() && schedule.is_active;
};

/**
 * Get the next occurrence date of a schedule
 * @param schedule - Schedule template
 * @param fromDate - Starting date
 */
export const getNextSessionDate = (schedule: Schedule, fromDate: Date = new Date()): Date => {
  const result = new Date(fromDate);
  const currentDay = result.getDay();
  const targetDay = schedule.day_of_week;
  
  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) daysToAdd += 7; // Next week
  
  result.setDate(result.getDate() + daysToAdd);
  return result;
};

/**
 * Format schedule time range
 * @param startTime - HH:mm:ss
 * @param endTime - HH:mm:ss
 */
export const formatScheduleTime = (startTime: string, endTime: string): string => {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
};

// Legacy exports for backward compatibility
export const getSessions = getAllSchedules;
export const getSessionById = getScheduleById;
export const createSession = createSchedule;
export const updateSession = updateSchedule;
export const deleteSession = deleteSchedule;
