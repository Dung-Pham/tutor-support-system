/**
 * File: services/scheduleService.ts
 * Mục đích: Business logic cho quản lý lịch dạy/học
 * Vai trò: Xử lý CRUD operations, calendar views, timeblock management
 */

import {
  Schedule,
  CreateScheduleDTO,
  UpdateScheduleDTO,
  CalendarViewParams,
  ScheduleTimeBlock,
  CreateTimeBlockDTO,
  ScheduleStatus,
  TimeBlockStatus,
  PaginatedResponse
} from '../types';
import { executeQuery, executeTransaction, buildPaginationQuery, getTotalCount } from '../utils/database';
import { QueryTypes } from 'sequelize';

/**
 * Create a new schedule from a tutor request
 */
export const createSchedule = async (data: CreateScheduleDTO, createdBy: number): Promise<Schedule> => {
  // First, get tutor request details
  const tutorRequestQuery = `
    SELECT tutorRequestId, tutorId, studentId, subjectId, status
    FROM TutorRequest
    WHERE tutorRequestId = :tutorRequestId
  `;
  
  const tutorRequests = await executeQuery<any[]>(tutorRequestQuery, { tutorRequestId: data.tutorRequestId });
  
  if (tutorRequests.length === 0) {
    throw new Error('Tutor request not found');
  }
  
  const tutorRequest = tutorRequests[0];
  
  if (tutorRequest.status !== 'accepted') {
    throw new Error('Can only create schedules from accepted tutor requests');
  }
  
  // Check for time conflicts
  const conflictQuery = `
    SELECT COUNT(*) as count
    FROM Schedule
    WHERE (tutorId = :tutorId OR studentId = :studentId)
      AND status NOT IN ('cancelled', 'completed')
      AND (
        (:startTime BETWEEN startTime AND endTime)
        OR (:endTime BETWEEN startTime AND endTime)
        OR (startTime BETWEEN :startTime AND :endTime)
      )
  `;
  
  const conflicts = await executeQuery<[{ count: number }]>(conflictQuery, {
    tutorId: tutorRequest.tutorId,
    studentId: tutorRequest.studentId,
    startTime: data.startTime,
    endTime: data.endTime
  });
  
  if (conflicts[0].count > 0) {
    throw new Error('Time conflict detected. Schedule overlaps with existing schedule.');
  }
  
  // Create schedule
  const insertQuery = `
    INSERT INTO Schedule (tutorRequestId, tutorId, studentId, subjectId, startTime, endTime, status, notes, createdAt, updatedAt)
    OUTPUT INSERTED.*
    VALUES (:tutorRequestId, :tutorId, :studentId, :subjectId, :startTime, :endTime, 'pending', :notes, GETDATE(), GETDATE())
  `;
  
  const result = await executeQuery<Schedule[]>(insertQuery, {
    tutorRequestId: data.tutorRequestId,
    tutorId: tutorRequest.tutorId,
    studentId: tutorRequest.studentId,
    subjectId: tutorRequest.subjectId,
    startTime: data.startTime,
    endTime: data.endTime,
    notes: data.notes || null
  }, QueryTypes.INSERT);
  
  return result[0];
};

/**
 * Get schedule by ID
 */
export const getScheduleById = async (scheduleId: number): Promise<Schedule | null> => {
  const query = `
    SELECT s.*, 
           t.fullName as tutorName,
           st.fullName as studentName,
           sub.subjectName
    FROM Schedule s
    LEFT JOIN [User] t ON s.tutorId = t.userId
    LEFT JOIN [User] st ON s.studentId = st.userId
    LEFT JOIN Subject sub ON s.subjectId = sub.subjectId
    WHERE s.scheduleId = :scheduleId
  `;
  
  const result = await executeQuery<any[]>(query, { scheduleId });
  return result.length > 0 ? result[0] : null;
};

/**
 * Update schedule
 */
export const updateSchedule = async (scheduleId: number, data: UpdateScheduleDTO): Promise<Schedule> => {
  const existing = await getScheduleById(scheduleId);
  
  if (!existing) {
    throw new Error('Schedule not found');
  }
  
  // Build update query dynamically
  const updates: string[] = [];
  const params: Record<string, any> = { scheduleId };
  
  if (data.startTime) {
    updates.push('startTime = :startTime');
    params.startTime = data.startTime;
  }
  
  if (data.endTime) {
    updates.push('endTime = :endTime');
    params.endTime = data.endTime;
  }
  
  if (data.status) {
    updates.push('status = :status');
    params.status = data.status;
  }
  
  if (data.notes !== undefined) {
    updates.push('notes = :notes');
    params.notes = data.notes;
  }
  
  updates.push('updatedAt = GETDATE()');
  
  const query = `
    UPDATE Schedule
    SET ${updates.join(', ')}
    OUTPUT INSERTED.*
    WHERE scheduleId = :scheduleId
  `;
  
  const result = await executeQuery<Schedule[]>(query, params, QueryTypes.UPDATE);
  return result[0];
};

/**
 * Delete schedule (soft delete by setting status to cancelled)
 */
export const deleteSchedule = async (scheduleId: number): Promise<void> => {
  const query = `
    UPDATE Schedule
    SET status = 'cancelled', updatedAt = GETDATE()
    WHERE scheduleId = :scheduleId
  `;
  
  await executeQuery(query, { scheduleId }, QueryTypes.UPDATE);
};

/**
 * Get calendar view (day, week, month)
 */
export const getCalendarView = async (params: CalendarViewParams): Promise<Schedule[]> => {
  const { userId, userRole, viewType, date } = params;
  
  // Calculate date range based on view type
  let startDate: Date;
  let endDate: Date;
  const inputDate = new Date(date);
  
  switch (viewType) {
    case 'day':
      startDate = new Date(inputDate.setHours(0, 0, 0, 0));
      endDate = new Date(inputDate.setHours(23, 59, 59, 999));
      break;
    
    case 'week':
      const dayOfWeek = inputDate.getDay();
      startDate = new Date(inputDate);
      startDate.setDate(inputDate.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'month':
      startDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
      endDate = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    
    default:
      throw new Error('Invalid view type');
  }
  
  // Build query based on user role
  let userCondition = '';
  if (userRole === 'tutor') {
    userCondition = 's.tutorId = :userId';
  } else if (userRole === 'student') {
    userCondition = 's.studentId = :userId';
  } else if (userRole === 'parent') {
    // For parents, get schedules of their children
    userCondition = `s.studentId IN (
      SELECT studentId FROM [User] WHERE parentId = :userId
    )`;
  }
  
  const query = `
    SELECT s.*,
           t.fullName as tutorName,
           st.fullName as studentName,
           sub.subjectName
    FROM Schedule s
    LEFT JOIN [User] t ON s.tutorId = t.userId
    LEFT JOIN [User] st ON s.studentId = st.userId
    LEFT JOIN Subject sub ON s.subjectId = sub.subjectId
    WHERE ${userCondition}
      AND s.startTime >= :startDate
      AND s.endTime <= :endDate
      AND s.status != 'cancelled'
    ORDER BY s.startTime ASC
  `;
  
  const result = await executeQuery<Schedule[]>(query, {
    userId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });
  
  return result;
};

/**
 * Get schedules with pagination
 */
export const getSchedules = async (
  filters: Partial<Schedule>,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Schedule>> => {
  const conditions: string[] = [];
  const params: Record<string, any> = {};
  
  if (filters.tutorId) {
    conditions.push('tutorId = :tutorId');
    params.tutorId = filters.tutorId;
  }
  
  if (filters.studentId) {
    conditions.push('studentId = :studentId');
    params.studentId = filters.studentId;
  }
  
  if (filters.status) {
    conditions.push('status = :status');
    params.status = filters.status;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const baseQuery = `SELECT * FROM Schedule ${whereClause}`;
  const { query, offset } = buildPaginationQuery(baseQuery, page, limit, 'startTime', 'DESC');
  
  const items = await executeQuery<Schedule[]>(query, params);
  const totalItems = await getTotalCount('Schedule', whereClause, params);
  
  return {
    items,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: limit
    }
  };
};

// ============ TimeBlock Management ============

/**
 * Create timeblock for tutor availability
 */
export const createTimeBlock = async (data: CreateTimeBlockDTO): Promise<ScheduleTimeBlock> => {
  // Check for conflicts
  const conflictQuery = `
    SELECT COUNT(*) as count
    FROM ScheduleTimeBlock
    WHERE tutorId = :tutorId
      AND dayOfWeek = :dayOfWeek
      AND status != 'locked'
      AND (
        (:startTime >= startTime AND :startTime < endTime)
        OR (:endTime > startTime AND :endTime <= endTime)
        OR (startTime >= :startTime AND endTime <= :endTime)
      )
  `;
  
  const conflicts = await executeQuery<[{ count: number }]>(conflictQuery, data);
  
  if (conflicts[0].count > 0) {
    throw new Error('Time block overlaps with existing timeblock');
  }
  
  const insertQuery = `
    INSERT INTO ScheduleTimeBlock (tutorId, dayOfWeek, startTime, endTime, status, createdAt)
    OUTPUT INSERTED.*
    VALUES (:tutorId, :dayOfWeek, :startTime, :endTime, 'available', GETDATE())
  `;
  
  const result = await executeQuery<ScheduleTimeBlock[]>(insertQuery, data, QueryTypes.INSERT);
  return result[0];
};

/**
 * Get timeblocks for a tutor
 */
export const getTimeBlocksByTutor = async (tutorId: number): Promise<ScheduleTimeBlock[]> => {
  const query = `
    SELECT *
    FROM ScheduleTimeBlock
    WHERE tutorId = :tutorId
    ORDER BY dayOfWeek, startTime
  `;
  
  return await executeQuery<ScheduleTimeBlock[]>(query, { tutorId });
};

/**
 * Update timeblock status (lock/unlock)
 */
export const updateTimeBlockStatus = async (
  timeBlockId: number,
  status: TimeBlockStatus
): Promise<ScheduleTimeBlock> => {
  const query = `
    UPDATE ScheduleTimeBlock
    SET status = :status
    OUTPUT INSERTED.*
    WHERE timeBlockId = :timeBlockId
  `;
  
  const result = await executeQuery<ScheduleTimeBlock[]>(query, { timeBlockId, status }, QueryTypes.UPDATE);
  
  if (result.length === 0) {
    throw new Error('TimeBlock not found');
  }
  
  return result[0];
};

/**
 * Delete timeblock
 */
export const deleteTimeBlock = async (timeBlockId: number): Promise<void> => {
  const query = `
    DELETE FROM ScheduleTimeBlock
    WHERE timeBlockId = :timeBlockId
  `;
  
  await executeQuery(query, { timeBlockId }, QueryTypes.DELETE);
};

/**
 * Get available timeblocks for a tutor on a specific date
 */
export const getAvailableTimeBlocks = async (tutorId: number, date: Date): Promise<ScheduleTimeBlock[]> => {
  const dayOfWeek = date.getDay();
  
  const query = `
    SELECT *
    FROM ScheduleTimeBlock
    WHERE tutorId = :tutorId
      AND dayOfWeek = :dayOfWeek
      AND status = 'available'
    ORDER BY startTime
  `;
  
  return await executeQuery<ScheduleTimeBlock[]>(query, { tutorId, dayOfWeek });
};
