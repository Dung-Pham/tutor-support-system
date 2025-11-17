/**
 * File: services/scheduleService.ts
 * Purpose: Business logic for schedule management
 * Updated to use new query modules with UUID and correct schema
 */

import * as scheduleQueries from '../database/queries/scheduleQueries';
import {
  Schedule,
  ScheduleTimeBlock,
  CreateScheduleDTO,
  UpdateScheduleDTO
} from '../database/queries/scheduleQueries';

/**
 * Create a new schedule
 */
export const createSchedule = async (data: CreateScheduleDTO): Promise<Schedule> => {
  // Check for conflicts
  const hasConflict = await scheduleQueries.checkScheduleConflict(
    data.tutor_id,
    new Date(data.start_date),
    new Date(data.end_date)
  );

  if (hasConflict) {
    throw new Error('Schedule conflict detected');
  }

  return await scheduleQueries.createSchedule(data);
};

/**
 * Get schedule by ID
 */
export const getScheduleById = async (scheduleId: string): Promise<Schedule | null> => {
  return await scheduleQueries.getScheduleById(scheduleId);
};

/**
 * Get schedules with filters
 */
export const getSchedules = async (
  filters: {
    tutor_id?: string;
    user_id?: string; // Changed from student_id
    class_id?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  },
  page: number = 1,
  limit: number = 20
): Promise<{ schedules: Schedule[]; total: number; page: number; totalPages: number }> => {
  const offset = (page - 1) * limit;

  const result = await scheduleQueries.getSchedules({
    ...filters,
    limit,
    offset,
  });

  return {
    schedules: result.schedules,
    total: result.total,
    page,
    totalPages: Math.ceil(result.total / limit),
  };
};

/**
 * Update schedule
 */
export const updateSchedule = async (
  scheduleId: string,
  data: UpdateScheduleDTO
): Promise<Schedule> => {
  // Check if schedule exists
  const existing = await scheduleQueries.getScheduleById(scheduleId);
  if (!existing) {
    throw new Error('Schedule not found');
  }

  // If updating time, check for conflicts
  if (data.start_date || data.end_date) {
    const startDate = data.start_date ? new Date(data.start_date) : existing.start_date;
    const endDate = data.end_date ? new Date(data.end_date) : existing.end_date;

    const hasConflict = await scheduleQueries.checkScheduleConflict(
      existing.tutor_id,
      startDate,
      endDate,
      scheduleId // Exclude current schedule from conflict check
    );

    if (hasConflict) {
      throw new Error('Schedule conflict detected');
    }
  }

  return await scheduleQueries.updateSchedule(scheduleId, data);
};

/**
 * Delete schedule
 */
export const deleteSchedule = async (scheduleId: string): Promise<boolean> => {
  const existing = await scheduleQueries.getScheduleById(scheduleId);
  if (!existing) {
    throw new Error('Schedule not found');
  }

  return await scheduleQueries.deleteSchedule(scheduleId);
};

/**
 * Get calendar view
 */
export const getCalendarView = async (
  userId: string,
  userRole: 'tutor' | 'user', // Changed from 'student' to 'user'
  startDate: Date,
  endDate: Date
): Promise<Schedule[]> => {
  return await scheduleQueries.getCalendarSchedules(userId, userRole, startDate, endDate);
};

/**
 * Check schedule conflicts
 */
export const checkConflicts = async (
  tutorId: string,
  startDate: Date,
  endDate: Date,
  excludeScheduleId?: string
): Promise<boolean> => {
  return await scheduleQueries.checkScheduleConflict(tutorId, startDate, endDate, excludeScheduleId);
};

// ============================================================
// TIME BLOCK SERVICES
// ============================================================

/**
 * Create time block
 */
export const createTimeBlock = async (data: {
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  week_start_date: Date | string;
  is_available?: boolean;
  reason_if_blocked?: string;
}): Promise<ScheduleTimeBlock> => {
  return await scheduleQueries.createTimeBlock(data);
};

/**
 * Get time blocks by tutor
 */
export const getTimeBlocksByTutor = async (
  tutorId: string,
  weekStartDate?: Date | string
): Promise<ScheduleTimeBlock[]> => {
  return await scheduleQueries.getTimeBlocks({
    tutor_id: tutorId,
    week_start_date: weekStartDate,
  });
};

/**
 * Update time block status
 */
export const updateTimeBlockStatus = async (
  timeblockId: string,
  isAvailable: boolean,
  reason?: string
): Promise<ScheduleTimeBlock> => {
  return await scheduleQueries.updateTimeBlockStatus(timeblockId, isAvailable, reason);
};

/**
 * Delete time block
 */
export const deleteTimeBlock = async (timeblockId: string): Promise<boolean> => {
  // Note: This function doesn't exist in queries yet, would need to add
  throw new Error('Delete timeblock not implemented in queries yet');
};

/**
 * Get available time blocks
 */
export const getAvailableTimeBlocks = async (
  tutorId: string,
  weekStartDate: Date | string
): Promise<ScheduleTimeBlock[]> => {
  const blocks = await scheduleQueries.getTimeBlocks({
    tutor_id: tutorId,
    week_start_date: weekStartDate,
  });

  // Filter for available only
  return blocks.filter((block) => block.is_available);
};
