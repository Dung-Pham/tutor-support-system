/**
 * File: services/scheduleService.ts
 * Purpose: Business logic for schedule management
 * Updated to match new schema: Schedule only has class_id, day_of_week, start_time, end_time, duration_minutes, is_active
 */

import * as scheduleQueries from '../database/queries/scheduleQueries';
import {
  Schedule,
  CreateScheduleDTO,
  UpdateScheduleDTO
} from '../database/queries/scheduleQueries';

/**
 * Create a new schedule for a class
 */
export const createSchedule = async (data: CreateScheduleDTO): Promise<Schedule[]> => {
  // Check for conflicts within the same class for each day
  for (const dayOfWeek of data.days_of_week) {
    const hasConflict = await scheduleQueries.checkScheduleConflict(
      data.class_id,
      dayOfWeek,
      data.start_time,
      data.end_time
    );

    if (hasConflict) {
      throw new Error(`Schedule conflict detected for this class on day ${dayOfWeek}`);
    }
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
 * Get schedules by class
 */
export const getSchedulesByClass = async (classId: string): Promise<Schedule[]> => {
  return await scheduleQueries.getSchedulesByClass(classId);
};

/**
 * Get schedules by tutor
 */
export const getSchedulesByTutor = async (tutorId: string): Promise<Schedule[]> => {
  return await scheduleQueries.getSchedulesByTutor(tutorId);
};

/**
 * Get schedules by student
 */
export const getSchedulesByStudent = async (studentId: string): Promise<Schedule[]> => {
  return await scheduleQueries.getSchedulesByStudent(studentId);
};

/**
 * Get schedules with filters and pagination
 */
export const getSchedules = async (
  filters: {
    class_id?: string;
    tutor_id?: string;
    student_id?: string;
    day_of_week?: number;
    is_active?: boolean;
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

  // If updating time or day, check for conflicts
  if (data.day_of_week !== undefined || data.start_time !== undefined || data.end_time !== undefined) {
    const dayOfWeek = data.day_of_week !== undefined ? data.day_of_week : existing.day_of_week;
    const startTime = data.start_time || existing.start_time;
    const endTime = data.end_time || existing.end_time;

    const hasConflict = await scheduleQueries.checkScheduleConflict(
      existing.class_id,
      dayOfWeek,
      startTime,
      endTime,
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
 * Deactivate schedule (soft delete)
 */
export const deactivateSchedule = async (scheduleId: string): Promise<Schedule> => {
  const existing = await scheduleQueries.getScheduleById(scheduleId);
  if (!existing) {
    throw new Error('Schedule not found');
  }

  return await scheduleQueries.deactivateSchedule(scheduleId);
};

/**
 * Get weekly schedules for a user
 */
export const getWeeklySchedules = async (
  userId: string,
  userRole: 'tutor' | 'student'
): Promise<Schedule[]> => {
  return await scheduleQueries.getWeeklySchedules(userId, userRole);
};

/**
 * Get today's schedules for a user
 */
export const getTodaySchedules = async (
  userId: string,
  userRole: 'tutor' | 'student'
): Promise<Schedule[]> => {
  return await scheduleQueries.getTodaySchedules(userId, userRole);
};

/**
 * Check schedule conflicts
 */
export const checkConflicts = async (
  classId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeScheduleId?: string
): Promise<boolean> => {
  return await scheduleQueries.checkScheduleConflict(
    classId,
    dayOfWeek,
    startTime,
    endTime,
    excludeScheduleId
  );
};

/**
 * Check tutor schedule conflicts across all classes
 */
export const checkTutorConflicts = async (
  tutorId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeScheduleId?: string
): Promise<boolean> => {
  return await scheduleQueries.checkTutorScheduleConflict(
    tutorId,
    dayOfWeek,
    startTime,
    endTime,
    excludeScheduleId
  );
};

/**
 * Bulk create schedules for a class
 */
export const bulkCreateSchedules = async (
  classId: string,
  schedules: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    duration_minutes?: number;
  }>
): Promise<Schedule[]> => {
  // Check for conflicts before creating
  for (const schedule of schedules) {
    const hasConflict = await scheduleQueries.checkScheduleConflict(
      classId,
      schedule.day_of_week,
      schedule.start_time,
      schedule.end_time
    );

    if (hasConflict) {
      throw new Error(`Schedule conflict detected for day ${schedule.day_of_week}`);
    }
  }

  return await scheduleQueries.bulkCreateSchedules(classId, schedules);
};

/**
 * Delete all schedules for a class
 */
export const deleteSchedulesByClass = async (classId: string): Promise<number> => {
  return await scheduleQueries.deleteSchedulesByClass(classId);
};

/**
 * Get schedule for a class on a specific day of week
 */
export const getScheduleByClassAndDay = async (
  classId: string,
  dayOfWeek: number
): Promise<Schedule | null> => {
  return await scheduleQueries.getScheduleByClassAndDay(classId, dayOfWeek);
};

/**
 * Get all schedules that apply to a specific date
 * Useful for finding what sessions are happening on a given day
 */
export const getSchedulesForDate = async (
  date: Date | string,
  tutorId?: string,
  studentId?: string
): Promise<Schedule[]> => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return await scheduleQueries.getSchedulesForDate(dateObj, tutorId, studentId);
};

/**
 * Get weekly schedule template for a user
 * Returns schedules organized by day of week (0-6)
 */
export const getWeeklyScheduleTemplate = async (
  userId: string,
  userRole: 'tutor' | 'student'
): Promise<Map<number, Schedule[]>> => {
  return await scheduleQueries.getWeeklySchedulesByUser(userId, userRole);
};

/**
 * Convert weekly schedule template to specific dates for a given week
 * Takes a week start date (Monday) and returns actual session dates
 */
export const getScheduleInstancesForWeek = async (
  userId: string,
  userRole: 'tutor' | 'student',
  weekStartDate: Date
): Promise<Array<{ schedule: Schedule; sessionDate: Date }>> => {
  console.log(`getScheduleInstancesForWeek - userId: ${userId}, role: ${userRole}, weekStart: ${weekStartDate}`);
  const weeklySchedules = await scheduleQueries.getWeeklySchedulesByUser(userId, userRole);
  console.log(`Got ${weeklySchedules.size} days of schedules`);
  const instances: Array<{ schedule: Schedule; sessionDate: Date }> = [];

  // weekStartDate should be Monday (day 1)
  // Convert day_of_week (0=Sun, 1=Mon, ..., 6=Sat) to date offset from Monday
  const dayOffsets: Record<number, number> = {
    0: 6, // Sunday -> +6 days from Monday
    1: 0, // Monday -> +0 days
    2: 1, // Tuesday -> +1 day
    3: 2, // Wednesday -> +2 days
    4: 3, // Thursday -> +3 days
    5: 4, // Friday -> +4 days
    6: 5, // Saturday -> +5 days
  };

  weeklySchedules.forEach((schedules, dayOfWeek) => {
    for (const schedule of schedules) {
      const sessionDate = new Date(weekStartDate);
      sessionDate.setDate(sessionDate.getDate() + dayOffsets[dayOfWeek]);
      
      // Filter by class start_date and end_date
      if (schedule.startDate && schedule.endDate) {
        const startDate = new Date(schedule.startDate);
        const endDate = new Date(schedule.endDate);
        if (sessionDate < startDate || sessionDate > endDate) {
          continue; // Skip this instance
        }
      }
      
      instances.push({ schedule, sessionDate });
    }
  });

  // Sort by date and time
  instances.sort((a, b) => {
    const dateCompare = a.sessionDate.getTime() - b.sessionDate.getTime();
    if (dateCompare !== 0) return dateCompare;
    // Convert start_time to string if it's not already (SQL Server returns it as string or object)
    const timeA = typeof a.schedule.start_time === 'string' ? a.schedule.start_time : String(a.schedule.start_time);
    const timeB = typeof b.schedule.start_time === 'string' ? b.schedule.start_time : String(b.schedule.start_time);
    return timeA.localeCompare(timeB);
  });

  return instances;
};