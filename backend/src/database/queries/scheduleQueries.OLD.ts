/**
 * File: database/queries/scheduleQueries.ts
 * Purpose: Database queries for Schedule and TimeBlock management
 * Schema: Matches SQLTSSupportServer.sql
 */

import dbConnection, { sql } from '../connection';

/**
 * Schedule interface matching actual SQL schema
 */
export interface Schedule {
  schedule_id: string; // UNIQUEIDENTIFIER
  class_id: string;
  tutor_id: string;
  student_id: string;
  parent_id: string;
  start_date: Date;
  end_date: Date;
  duration_minutes: number;
  day_of_week?: number;
  recurrence_type?: string;
  original_schedule_id?: string;
  status: string;
  is_locked: boolean;
  lock_reason?: string;
  tutor_name?: string;
  student_name?: string;
  class_name?: string;
  year_month?: number;
  created_at: Date;
  updated_at?: Date;
}

export interface CreateScheduleDTO {
  class_id: string;
  tutor_id: string;
  student_id: string;
  parent_id: string;
  start_date: Date | string;
  end_date: Date | string;
  duration_minutes: number;
  day_of_week?: number;
  recurrence_type?: string;
  status?: string;
}

export interface UpdateScheduleDTO {
  start_date?: Date | string;
  end_date?: Date | string;
  duration_minutes?: number;
  status?: string;
  is_locked?: boolean;
  lock_reason?: string;
}

/**
 * Create a new schedule
 * @param data Schedule creation data
 * @returns Promise<Schedule>
 */
export const createSchedule = async (data: CreateScheduleDTO): Promise<Schedule> => {
  const query = `
    INSERT INTO [Schedule] (
      class_id, tutor_id, student_id, parent_id,
      start_date, end_date, duration_minutes,
      day_of_week, recurrence_type, [status],
      created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @class_id, @tutor_id, @student_id, @parent_id,
      @start_date, @end_date, @duration_minutes,
      @day_of_week, @recurrence_type, @status,
      GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<Schedule>(query, {
    class_id: data.class_id,
    tutor_id: data.tutor_id,
    student_id: data.student_id,
    parent_id: data.parent_id,
    start_date: data.start_date,
    end_date: data.end_date,
    duration_minutes: data.duration_minutes,
    day_of_week: data.day_of_week || null,
    recurrence_type: data.recurrence_type || null,
    status: data.status || 'ACTIVE',
  });

  return result.recordset[0];
};

/**
 * Get schedule by ID
 * @param scheduleId Schedule ID
 * @returns Promise<Schedule | null>
 */
export const getScheduleById = async (scheduleId: number): Promise<Schedule | null> => {
  const query = `
    SELECT s.*, 
           tr.tutorId, tr.studentId, tr.subjectId,
           u1.name as tutorName, u2.name as studentName
    FROM Schedule s
    LEFT JOIN TutorRequest tr ON s.tutorRequestId = tr.id
    LEFT JOIN [User] u1 ON tr.tutorId = u1.id
    LEFT JOIN [User] u2 ON tr.studentId = u2.id
    WHERE s.id = @scheduleId
  `;

  const result = await dbConnection.query<Schedule>(query, { scheduleId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get schedules with filters
 * @param filters Query filters
 * @returns Promise<Schedule[]>
 */
export const getSchedules = async (filters: {
  tutorId?: number;
  studentId?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ schedules: Schedule[]; total: number }> => {
  let whereConditions: string[] = ['1=1'];
  const params: Record<string, any> = {};

  if (filters.tutorId) {
    whereConditions.push('tr.tutorId = @tutorId');
    params.tutorId = filters.tutorId;
  }

  if (filters.studentId) {
    whereConditions.push('tr.studentId = @studentId');
    params.studentId = filters.studentId;
  }

  if (filters.status) {
    whereConditions.push('s.status = @status');
    params.status = filters.status;
  }

  if (filters.startDate) {
    whereConditions.push('s.startTime >= @startDate');
    params.startDate = filters.startDate;
  }

  if (filters.endDate) {
    whereConditions.push('s.endTime <= @endDate');
    params.endDate = filters.endDate;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM Schedule s
    LEFT JOIN TutorRequest tr ON s.tutorRequestId = tr.id
    WHERE ${whereClause}
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, params);
  const total = countResult.recordset[0].total;

  // Get schedules
  const query = `
    SELECT s.*, 
           tr.tutorId, tr.studentId, tr.subjectId,
           u1.name as tutorName, u2.name as studentName
    FROM Schedule s
    LEFT JOIN TutorRequest tr ON s.tutorRequestId = tr.id
    LEFT JOIN [User] u1 ON tr.tutorId = u1.id
    LEFT JOIN [User] u2 ON tr.studentId = u2.id
    WHERE ${whereClause}
    ORDER BY s.startTime DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  params.limit = filters.limit || 20;
  params.offset = filters.offset || 0;

  const result = await dbConnection.query<Schedule>(query, params);

  return {
    schedules: result.recordset,
    total,
  };
};

/**
 * Update schedule
 * @param scheduleId Schedule ID
 * @param data Update data
 * @returns Promise<Schedule>
 */
export const updateSchedule = async (
  scheduleId: number,
  data: UpdateScheduleDTO
): Promise<Schedule> => {
  const updateFields: string[] = [];
  const params: Record<string, any> = { scheduleId };

  if (data.startTime !== undefined) {
    updateFields.push('startTime = @startTime');
    params.startTime = data.startTime;
  }

  if (data.endTime !== undefined) {
    updateFields.push('endTime = @endTime');
    params.endTime = data.endTime;
  }

  if (data.status !== undefined) {
    updateFields.push('status = @status');
    params.status = data.status;
  }

  if (data.notes !== undefined) {
    updateFields.push('notes = @notes');
    params.notes = data.notes;
  }

  updateFields.push('updatedAt = GETDATE()');

  const query = `
    UPDATE Schedule
    SET ${updateFields.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @scheduleId
  `;

  const result = await dbConnection.query<Schedule>(query, params);
  return result.recordset[0];
};

/**
 * Delete schedule
 * @param scheduleId Schedule ID
 * @returns Promise<boolean>
 */
export const deleteSchedule = async (scheduleId: number): Promise<boolean> => {
  const query = `
    DELETE FROM Schedule
    WHERE id = @scheduleId
  `;

  const result = await dbConnection.query(query, { scheduleId });
  return result.rowsAffected[0] > 0;
};

/**
 * Check for schedule conflicts
 * @param tutorId Tutor ID
 * @param startTime Start time
 * @param endTime End time
 * @param excludeScheduleId Schedule ID to exclude (for updates)
 * @returns Promise<boolean>
 */
export const checkScheduleConflict = async (
  tutorId: number,
  startTime: Date,
  endTime: Date,
  excludeScheduleId?: number
): Promise<boolean> => {
  let query = `
    SELECT COUNT(*) as count
    FROM Schedule s
    INNER JOIN TutorRequest tr ON s.tutorRequestId = tr.id
    WHERE tr.tutorId = @tutorId
      AND s.status NOT IN ('cancelled', 'completed')
      AND (
        (s.startTime <= @startTime AND s.endTime > @startTime)
        OR (s.startTime < @endTime AND s.endTime >= @endTime)
        OR (s.startTime >= @startTime AND s.endTime <= @endTime)
      )
  `;

  const params: Record<string, any> = { tutorId, startTime, endTime };

  if (excludeScheduleId) {
    query += ' AND s.id != @excludeScheduleId';
    params.excludeScheduleId = excludeScheduleId;
  }

  const result = await dbConnection.query<{ count: number }>(query, params);
  return result.recordset[0].count > 0;
};

/**
 * Get calendar view schedules
 * @param userId User ID
 * @param userRole User role ('tutor' or 'student')
 * @param startDate Start date
 * @param endDate End date
 * @param view View type ('day', 'week', 'month')
 * @returns Promise<Schedule[]>
 */
export const getCalendarSchedules = async (
  userId: number,
  userRole: 'tutor' | 'student',
  startDate: Date,
  endDate: Date,
  view: 'day' | 'week' | 'month'
): Promise<Schedule[]> => {
  const userFilter = userRole === 'tutor' ? 'tr.tutorId' : 'tr.studentId';

  const query = `
    SELECT s.*, 
           tr.tutorId, tr.studentId, tr.subjectId,
           u1.name as tutorName, u2.name as studentName,
           sub.name as subjectName
    FROM Schedule s
    LEFT JOIN TutorRequest tr ON s.tutorRequestId = tr.id
    LEFT JOIN [User] u1 ON tr.tutorId = u1.id
    LEFT JOIN [User] u2 ON tr.studentId = u2.id
    LEFT JOIN Subject sub ON tr.subjectId = sub.id
    WHERE ${userFilter} = @userId
      AND s.startTime >= @startDate
      AND s.endTime <= @endDate
      AND s.status != 'cancelled'
    ORDER BY s.startTime ASC
  `;

  const result = await dbConnection.query<Schedule>(query, {
    userId,
    startDate,
    endDate,
  });

  return result.recordset;
};

/**
 * Create a time block
 * @param scheduleId Schedule ID
 * @param data Time block data
 * @returns Promise<ScheduleTimeBlock>
 */
export const createTimeBlock = async (
  scheduleId: number,
  data: { startTime: Date; endTime: Date; topic?: string; status?: string }
): Promise<ScheduleTimeBlock> => {
  const query = `
    INSERT INTO ScheduleTimeBlock (
      scheduleId, startTime, endTime, topic, status, createdAt, updatedAt
    )
    OUTPUT INSERTED.*
    VALUES (
      @scheduleId, @startTime, @endTime, @topic, @status, GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<ScheduleTimeBlock>(query, {
    scheduleId,
    startTime: data.startTime,
    endTime: data.endTime,
    topic: data.topic || null,
    status: data.status || 'pending',
  });

  return result.recordset[0];
};

/**
 * Get time blocks for a schedule
 * @param scheduleId Schedule ID
 * @returns Promise<ScheduleTimeBlock[]>
 */
export const getTimeBlocks = async (scheduleId: number): Promise<ScheduleTimeBlock[]> => {
  const query = `
    SELECT *
    FROM ScheduleTimeBlock
    WHERE scheduleId = @scheduleId
    ORDER BY startTime ASC
  `;

  const result = await dbConnection.query<ScheduleTimeBlock>(query, { scheduleId });
  return result.recordset;
};

/**
 * Update time block status
 * @param timeBlockId Time block ID
 * @param status New status
 * @returns Promise<ScheduleTimeBlock>
 */
export const updateTimeBlockStatus = async (
  timeBlockId: number,
  status: string
): Promise<ScheduleTimeBlock> => {
  const query = `
    UPDATE ScheduleTimeBlock
    SET status = @status, updatedAt = GETDATE()
    OUTPUT INSERTED.*
    WHERE id = @timeBlockId
  `;

  const result = await dbConnection.query<ScheduleTimeBlock>(query, {
    timeBlockId,
    status,
  });

  return result.recordset[0];
};
