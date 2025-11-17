/**
 * File: database/queries/scheduleQueries.ts
 * Purpose: Database queries for Schedule and TimeBlock management
 * Schema: Matches SQLTSSupportServer.sql
 */

import dbConnection from '../connection';

/**
 * Schedule interface matching actual SQL schema
 */
export interface Schedule {
  schedule_id: string; // UNIQUEIDENTIFIER
  class_id: string;
  tutor_id: string;
  user_id: string; // The client (parent or student acting as USER)
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
  user_name?: string; // USER (parent or student)
  class_name?: string;
  year_month?: number;
  created_at: Date;
  updated_at?: Date;
}

export interface ScheduleTimeBlock {
  timeblock_id: string;
  tutor_id: string; // Only tutor's availability, no class_id
  day_of_week: number;
  start_time: string; // TIME format
  end_time: string; // TIME format
  is_available: boolean;
  reason_if_blocked?: string;
  week_start_date: Date;
  created_at: Date;
  updated_at?: Date;
}

export interface CreateScheduleDTO {
  class_id: string;
  tutor_id: string;
  user_id: string; // The client (parent or student)
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
 */
export const createSchedule = async (data: CreateScheduleDTO): Promise<Schedule> => {
  const query = `
    INSERT INTO [Schedule] (
      class_id, tutor_id, user_id,
      start_date, end_date, duration_minutes,
      day_of_week, recurrence_type, [status],
      created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @class_id, @tutor_id, @user_id,
      @start_date, @end_date, @duration_minutes,
      @day_of_week, @recurrence_type, @status,
      GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<Schedule>(query, {
    class_id: data.class_id,
    tutor_id: data.tutor_id,
    user_id: data.user_id,
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
 */
export const getScheduleById = async (scheduleId: string): Promise<Schedule | null> => {
  const query = `
    SELECT s.*, 
           c.[name] as class_name,
           u1.[name] as tutor_name,
           u2.[name] as user_name
    FROM [Schedule] s
    LEFT JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [UserAccount] u1 ON s.tutor_id = u1.user_id
    LEFT JOIN [UserAccount] u2 ON s.user_id = u2.user_id
    WHERE s.schedule_id = @scheduleId
  `;

  const result = await dbConnection.query<Schedule>(query, { scheduleId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get schedules with filters
 */
export const getSchedules = async (filters: {
  class_id?: string;
  tutor_id?: string;
  user_id?: string; // Changed from student_id
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ schedules: Schedule[]; total: number }> => {
  let whereConditions: string[] = ['1=1'];
  const params: Record<string, any> = {};

  if (filters.class_id) {
    whereConditions.push('s.class_id = @class_id');
    params.class_id = filters.class_id;
  }

  if (filters.tutor_id) {
    whereConditions.push('s.tutor_id = @tutor_id');
    params.tutor_id = filters.tutor_id;
  }

  if (filters.user_id) {
    whereConditions.push('s.user_id = @user_id');
    params.user_id = filters.user_id;
  }

  if (filters.status) {
    whereConditions.push('s.status = @status');
    params.status = filters.status;
  }

  if (filters.startDate) {
    whereConditions.push('s.start_date >= @startDate');
    params.startDate = filters.startDate;
  }

  if (filters.endDate) {
    whereConditions.push('s.end_date <= @endDate');
    params.endDate = filters.endDate;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM [Schedule] s
    WHERE ${whereClause}
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, params);
  const total = countResult.recordset[0].total;

  // Get schedules
  const query = `
    SELECT s.*, 
           c.[name] as class_name,
           u1.[name] as tutor_name,
           u2.[name] as user_name
    FROM [Schedule] s
    LEFT JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [UserAccount] u1 ON s.tutor_id = u1.user_id
    LEFT JOIN [UserAccount] u2 ON s.user_id = u2.user_id
    WHERE ${whereClause}
    ORDER BY s.start_date DESC
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
 */
export const updateSchedule = async (
  scheduleId: string,
  data: UpdateScheduleDTO
): Promise<Schedule> => {
  const updateFields: string[] = [];
  const params: Record<string, any> = { scheduleId };

  if (data.start_date !== undefined) {
    updateFields.push('start_date = @start_date');
    params.start_date = data.start_date;
  }

  if (data.end_date !== undefined) {
    updateFields.push('end_date = @end_date');
    params.end_date = data.end_date;
  }

  if (data.duration_minutes !== undefined) {
    updateFields.push('duration_minutes = @duration_minutes');
    params.duration_minutes = data.duration_minutes;
  }

  if (data.status !== undefined) {
    updateFields.push('[status] = @status');
    params.status = data.status;
  }

  if (data.is_locked !== undefined) {
    updateFields.push('is_locked = @is_locked');
    params.is_locked = data.is_locked;
  }

  if (data.lock_reason !== undefined) {
    updateFields.push('lock_reason = @lock_reason');
    params.lock_reason = data.lock_reason;
  }

  updateFields.push('updated_at = GETDATE()');

  const query = `
    UPDATE [Schedule]
    SET ${updateFields.join(', ')}
    OUTPUT INSERTED.*
    WHERE schedule_id = @scheduleId
  `;

  const result = await dbConnection.query<Schedule>(query, params);
  return result.recordset[0];
};

/**
 * Delete schedule
 */
export const deleteSchedule = async (scheduleId: string): Promise<boolean> => {
  const query = `
    DELETE FROM [Schedule]
    WHERE schedule_id = @scheduleId
  `;

  const result = await dbConnection.query(query, { scheduleId });
  return result.rowsAffected[0] > 0;
};

/**
 * Check for schedule conflicts
 */
export const checkScheduleConflict = async (
  tutorId: string,
  startDate: Date,
  endDate: Date,
  excludeScheduleId?: string
): Promise<boolean> => {
  let query = `
    SELECT COUNT(*) as count
    FROM [Schedule]
    WHERE tutor_id = @tutorId
      AND [status] NOT IN ('CANCELLED', 'COMPLETED')
      AND (
        (start_date <= @startDate AND end_date > @startDate)
        OR (start_date < @endDate AND end_date >= @endDate)
        OR (start_date >= @startDate AND end_date <= @endDate)
      )
  `;

  const params: Record<string, any> = { tutorId, startDate, endDate };

  if (excludeScheduleId) {
    query += ' AND schedule_id != @excludeScheduleId';
    params.excludeScheduleId = excludeScheduleId;
  }

  const result = await dbConnection.query<{ count: number }>(query, params);
  return result.recordset[0].count > 0;
};

/**
 * Get calendar view schedules
 */
export const getCalendarSchedules = async (
  userId: string,
  userRole: 'tutor' | 'user',
  startDate: Date,
  endDate: Date
): Promise<Schedule[]> => {
  const userFilter = userRole === 'tutor' ? 'tutor_id' : 'user_id';

  const query = `
    SELECT s.*, 
           c.[name] as class_name,
           u1.[name] as tutor_name,
           u2.[name] as user_name
    FROM [Schedule] s
    LEFT JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [UserAccount] u1 ON s.tutor_id = u1.user_id
    LEFT JOIN [UserAccount] u2 ON s.user_id = u2.user_id
    WHERE s.${userFilter} = @userId
      AND s.start_date >= @startDate
      AND s.end_date <= @endDate
      AND s.[status] != 'CANCELLED'
    ORDER BY s.start_date ASC
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
 */
export const createTimeBlock = async (
  data: {
    tutor_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    week_start_date: Date | string;
    is_available?: boolean;
    reason_if_blocked?: string;
  }
): Promise<ScheduleTimeBlock> => {
  const query = `
    INSERT INTO [ScheduleTimeBlock] (
      tutor_id, day_of_week, start_time, end_time,
      is_available, reason_if_blocked, week_start_date,
      created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @tutor_id, @day_of_week, @start_time, @end_time,
      @is_available, @reason_if_blocked, @week_start_date,
      GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<ScheduleTimeBlock>(query, {
    tutor_id: data.tutor_id,
    day_of_week: data.day_of_week,
    start_time: data.start_time,
    end_time: data.end_time,
    is_available: data.is_available !== undefined ? data.is_available : true,
    reason_if_blocked: data.reason_if_blocked || null,
    week_start_date: data.week_start_date,
  });

  return result.recordset[0];
};

/**
 * Get time blocks
 */
export const getTimeBlocks = async (filters: {
  tutor_id?: string;
  week_start_date?: Date | string;
}): Promise<ScheduleTimeBlock[]> => {
  let whereConditions: string[] = ['1=1'];
  const params: Record<string, any> = {};

  if (filters.tutor_id) {
    whereConditions.push('tutor_id = @tutor_id');
    params.tutor_id = filters.tutor_id;
  }

  if (filters.week_start_date) {
    whereConditions.push('week_start_date = @week_start_date');
    params.week_start_date = filters.week_start_date;
  }

  const whereClause = whereConditions.join(' AND ');

  const query = `
    SELECT *
    FROM [ScheduleTimeBlock]
    WHERE ${whereClause}
    ORDER BY day_of_week, start_time
  `;

  const result = await dbConnection.query<ScheduleTimeBlock>(query, params);
  return result.recordset;
};

/**
 * Update time block status
 */
export const updateTimeBlockStatus = async (
  timeblockId: string,
  isAvailable: boolean,
  reason?: string
): Promise<ScheduleTimeBlock> => {
  const query = `
    UPDATE [ScheduleTimeBlock]
    SET is_available = @is_available,
        reason_if_blocked = @reason_if_blocked,
        updated_at = GETDATE()
    OUTPUT INSERTED.*
    WHERE timeblock_id = @timeblockId
  `;

  const result = await dbConnection.query<ScheduleTimeBlock>(query, {
    timeblockId,
    is_available: isAvailable,
    reason_if_blocked: reason || null,
  });

  return result.recordset[0];
};
