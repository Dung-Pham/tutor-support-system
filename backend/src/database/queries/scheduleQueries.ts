/**
 * File: database/queries/scheduleQueries.ts
 * Purpose: Database queries for Schedule management
 * Schema: Matches tutorsupportdb_merged-v2.sql
 * 
 * Schedule table fields:
 * - schedule_id (UNIQUEIDENTIFIER)
 * - class_id (UNIQUEIDENTIFIER) - FK to Class
 * - day_of_week (int)
 * - start_time (time)
 * - end_time (time)
 * - duration_minutes (int)
 * - is_active (bit)
 * - created_at (datetime2)
 * - updated_at (datetime2)
 */

import dbConnection from '../connection';

/**
 * Schedule interface matching actual SQL schema
 */
export interface Schedule {
  schedule_id: string;
  class_id: string;
  day_of_week: number;
  start_time: string; // TIME format HH:mm:ss
  end_time: string;   // TIME format HH:mm:ss
  duration_minutes: number;
  is_active: boolean;
  created_at: Date;
  updated_at?: Date;
  // Joined fields from Class
  tutor_id?: string;
  student_id?: string;
  subject_name?: string;
  tutor_name?: string;
  student_name?: string;
  class_name?: string; // Generated from subject_name
  startDate?: Date;        // Class start date
  endDate?: Date;          // Class end date
}

export interface CreateScheduleDTO {
  class_id: string;
  days_of_week: number[];    // Array of 0 = Sunday, 1 = Monday, ... 6 = Saturday
  start_time: string;       // HH:mm or HH:mm:ss
  end_time: string;         // HH:mm or HH:mm:ss
  duration_minutes?: number;
  is_active?: boolean;
}

export interface UpdateScheduleDTO {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  is_active?: boolean;
}

/**
 * Create new schedules for multiple days of the week
 */
export const createSchedule = async (data: CreateScheduleDTO): Promise<Schedule[]> => {
  const schedules: Schedule[] = [];

  for (const dayOfWeek of data.days_of_week) {
    const query = `
      INSERT INTO [Schedule] (
        class_id, day_of_week, start_time, end_time,
        duration_minutes, is_active, created_at, updated_at
      )
      OUTPUT INSERTED.*
      VALUES (
        @class_id, @day_of_week, @start_time, @end_time,
        @duration_minutes, @is_active, GETDATE(), GETDATE()
      )
    `;

    const result = await dbConnection.query<Schedule>(query, {
      class_id: data.class_id,
      day_of_week: dayOfWeek,
      start_time: data.start_time,
      end_time: data.end_time,
      duration_minutes: data.duration_minutes || null,
      is_active: data.is_active !== undefined ? data.is_active : true,
    });

    schedules.push(result.recordset[0]);
  }

  return schedules;
};

/**
 * Get schedule by ID with class and user info
 */
export const getScheduleById = async (scheduleId: string): Promise<Schedule | null> => {
  const query = `
    SELECT 
      s.*,
      c.tutor_id,
      c.student_id,
      c.description as class_name,
      sub.name as subject_name,
      t.name as tutor_name,
      st.name as student_name
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE s.schedule_id = @scheduleId
  `;

  const result = await dbConnection.query<Schedule>(query, { scheduleId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get schedules by class ID
 */
export const getSchedulesByClass = async (classId: string): Promise<Schedule[]> => {
  const query = `
    SELECT 
      s.*,
      c.tutor_id,
      c.student_id,
      c.description as class_name,
      sub.name as subject_name,
      t.name as tutor_name,
      st.name as student_name
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE s.class_id = @classId
    ORDER BY s.day_of_week, s.start_time
  `;

  const result = await dbConnection.query<Schedule>(query, { classId });
  return result.recordset;
};

/**
 * Get schedules with filters
 */
export const getSchedules = async (filters: {
  class_id?: string;
  tutor_id?: string;
  student_id?: string;
  day_of_week?: number;
  is_active?: boolean;
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
    whereConditions.push('c.tutor_id = @tutor_id');
    params.tutor_id = filters.tutor_id;
  }

  if (filters.student_id) {
    whereConditions.push('c.student_id = @student_id');
    params.student_id = filters.student_id;
  }

  if (filters.day_of_week !== undefined) {
    whereConditions.push('s.day_of_week = @day_of_week');
    params.day_of_week = filters.day_of_week;
  }

  if (filters.is_active !== undefined) {
    whereConditions.push('s.is_active = @is_active');
    params.is_active = filters.is_active;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    WHERE ${whereClause}
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, params);
  const total = countResult.recordset[0].total;

  // Get schedules
  const query = `
    SELECT 
      s.*,
      c.tutor_id,
      c.student_id,
      c.description as class_name,
      sub.name as subject_name,
      t.name as tutor_name,
      st.name as student_name
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE ${whereClause}
    ORDER BY s.day_of_week, s.start_time
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
 * Get schedules by tutor ID
 */
export const getSchedulesByTutor = async (tutorId: string): Promise<Schedule[]> => {
  const query = `
    SELECT 
      s.*,
      c.tutor_id,
      c.student_id,
      c.description as class_name,
      sub.name as subject_name,
      t.name as tutor_name,
      st.name as student_name
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE c.tutor_id = @tutorId AND s.is_active = 1
    ORDER BY s.day_of_week, s.start_time
  `;

  const result = await dbConnection.query<Schedule>(query, { tutorId });
  return result.recordset;
};

/**
 * Get schedules by student ID
 */
export const getSchedulesByStudent = async (studentId: string): Promise<Schedule[]> => {
  const query = `
    SELECT 
      s.*,
      c.tutor_id,
      c.student_id,
      c.description as class_name,
      sub.name as subject_name,
      t.name as tutor_name,
      st.name as student_name
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE c.student_id = @studentId AND s.is_active = 1
    ORDER BY s.day_of_week, s.start_time
  `;

  const result = await dbConnection.query<Schedule>(query, { studentId });
  return result.recordset;
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

  if (data.day_of_week !== undefined) {
    updateFields.push('day_of_week = @day_of_week');
    params.day_of_week = data.day_of_week;
  }

  if (data.start_time !== undefined) {
    updateFields.push('start_time = @start_time');
    params.start_time = data.start_time;
  }

  if (data.end_time !== undefined) {
    updateFields.push('end_time = @end_time');
    params.end_time = data.end_time;
  }

  if (data.duration_minutes !== undefined) {
    updateFields.push('duration_minutes = @duration_minutes');
    params.duration_minutes = data.duration_minutes;
  }

  if (data.is_active !== undefined) {
    updateFields.push('is_active = @is_active');
    params.is_active = data.is_active;
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
 * Soft delete schedule (set is_active = false)
 */
export const deactivateSchedule = async (scheduleId: string): Promise<Schedule> => {
  const query = `
    UPDATE [Schedule]
    SET is_active = 0, updated_at = GETDATE()
    OUTPUT INSERTED.*
    WHERE schedule_id = @scheduleId
  `;

  const result = await dbConnection.query<Schedule>(query, { scheduleId });
  return result.recordset[0];
};

/**
 * Check for schedule conflicts (same class, same day, overlapping time)
 */
export const checkScheduleConflict = async (
  classId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeScheduleId?: string
): Promise<boolean> => {
  let query = `
    SELECT COUNT(*) as count
    FROM [Schedule]
    WHERE class_id = @classId
      AND day_of_week = @dayOfWeek
      AND is_active = 1
      AND (
        (start_time <= @startTime AND end_time > @startTime)
        OR (start_time < @endTime AND end_time >= @endTime)
        OR (start_time >= @startTime AND end_time <= @endTime)
      )
  `;

  const params: Record<string, any> = { classId, dayOfWeek, startTime, endTime };

  if (excludeScheduleId) {
    query += ' AND schedule_id != @excludeScheduleId';
    params.excludeScheduleId = excludeScheduleId;
  }

  const result = await dbConnection.query<{ count: number }>(query, params);
  return result.recordset[0].count > 0;
};

/**
 * Check tutor schedule conflict (across all classes)
 */
export const checkTutorScheduleConflict = async (
  tutorId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeScheduleId?: string
): Promise<boolean> => {
  let query = `
    SELECT COUNT(*) as count
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    WHERE c.tutor_id = @tutorId
      AND s.day_of_week = @dayOfWeek
      AND s.is_active = 1
      AND (
        (s.start_time <= @startTime AND s.end_time > @startTime)
        OR (s.start_time < @endTime AND s.end_time >= @endTime)
        OR (s.start_time >= @startTime AND s.end_time <= @endTime)
      )
  `;

  const params: Record<string, any> = { tutorId, dayOfWeek, startTime, endTime };

  if (excludeScheduleId) {
    query += ' AND s.schedule_id != @excludeScheduleId';
    params.excludeScheduleId = excludeScheduleId;
  }

  const result = await dbConnection.query<{ count: number }>(query, params);
  return result.recordset[0].count > 0;
};

/**
 * Get weekly schedules for a user (tutor or student)
 */
export const getWeeklySchedules = async (
  userId: string,
  userRole: 'tutor' | 'student'
): Promise<Schedule[]> => {
  const userFilter = userRole === 'tutor' ? 'c.tutor_id' : 'c.student_id';

  const query = `
    SELECT 
      s.*,
      c.tutor_id,
      c.student_id,
      sub.name as subject_name,
      t.name as tutor_name,
      st.name as student_name
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE ${userFilter} = @userId
      AND s.is_active = 1
      AND c.status IN ('active', 'recruiting', 'in_progress')
    ORDER BY s.day_of_week, s.start_time
  `;

  const result = await dbConnection.query<Schedule>(query, { userId });
  return result.recordset;
};

/**
 * Get schedules for today (by day of week)
 */
export const getTodaySchedules = async (
  userId: string,
  userRole: 'tutor' | 'student'
): Promise<Schedule[]> => {
  const userFilter = userRole === 'tutor' ? 'c.tutor_id' : 'c.student_id';
  const today = new Date().getDay(); // 0 = Sunday

  const query = `
    SELECT 
      s.*,
      c.tutor_id,
      c.student_id,
      sub.name as subject_name,
      t.name as tutor_name,
      st.name as student_name
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE ${userFilter} = @userId
      AND s.day_of_week = @today
      AND s.is_active = 1
      AND c.status IN ('active', 'recruiting', 'in_progress')
    ORDER BY s.start_time
  `;

  const result = await dbConnection.query<Schedule>(query, { userId, today });
  return result.recordset;
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
  if (schedules.length === 0) return [];

  // Assume all schedules have the same time settings
  const days_of_week = schedules.map(s => s.day_of_week);
  const { start_time, end_time, duration_minutes } = schedules[0];

  return await createSchedule({
    class_id: classId,
    days_of_week,
    start_time,
    end_time,
    duration_minutes,
    is_active: true,
  });
};

/**
 * Delete all schedules for a class
 */
export const deleteSchedulesByClass = async (classId: string): Promise<number> => {
  const query = `
    DELETE FROM [Schedule]
    WHERE class_id = @classId
  `;

  const result = await dbConnection.query(query, { classId });
  return result.rowsAffected[0];
};

/**
 * Get schedule by class and day of week
 * Useful for finding which schedule template applies to a specific date
 */
export const getScheduleByClassAndDay = async (
  classId: string,
  dayOfWeek: number
): Promise<Schedule | null> => {
  const query = `
    SELECT 
      s.*,
      c.tutor_id,
      c.student_id,
      c.description as class_name,
      sub.name as subject_name,
      t.name as tutor_name,
      st.name as student_name
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE s.class_id = @classId
      AND s.day_of_week = @dayOfWeek
      AND s.is_active = 1
  `;

  const result = await dbConnection.query<Schedule>(query, { classId, dayOfWeek });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get schedules for a specific date across all active classes
 * This finds all schedule templates that match a given day of week
 */
export const getSchedulesForDate = async (
  date: Date,
  tutorId?: string,
  studentId?: string
): Promise<Schedule[]> => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

  let whereConditions: string[] = [
    's.day_of_week = @dayOfWeek',
    's.is_active = 1',
    "c.status IN ('active', 'recruiting', 'in_progress')"
  ];
  const params: Record<string, any> = { dayOfWeek };

  if (tutorId) {
    whereConditions.push('c.tutor_id = @tutorId');
    params.tutorId = tutorId;
  }

  if (studentId) {
    whereConditions.push('c.student_id = @studentId');
    params.studentId = studentId;
  }

  const query = `
    SELECT 
      s.*,
      c.tutor_id,
      c.student_id,
      c.description as class_name,
      sub.name as subject_name,
      t.name as tutor_name,
      st.name as student_name
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY s.start_time
  `;

  const result = await dbConnection.query<Schedule>(query, params);
  return result.recordset;
};

/**
 * Get all schedules for a week (for calendar view)
 * Returns schedules grouped by day_of_week
 */
export const getWeeklySchedulesByUser = async (
  userId: string,
  userRole: 'tutor' | 'student'
): Promise<Map<number, Schedule[]>> => {
  console.log(`getWeeklySchedulesByUser - userId: ${userId}, role: ${userRole}`);
  const userFilter = userRole === 'tutor' ? 'c.tutor_id' : 'c.student_id';

  const query = `
    SELECT 
      s.*,
      c.tutor_id,
      c.student_id,
      c.start_date as startDate,
      c.end_date as endDate,
      c.description as class_name,
      sub.name as subject_name,
      t.name as tutor_name,
      st.name as student_name
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE ${userFilter} = @userId
      AND s.is_active = 1
      AND c.status IN ('active', 'recruiting', 'in_progress')
    ORDER BY s.day_of_week, s.start_time
  `;

  const result = await dbConnection.query<Schedule>(query, { userId });
  console.log(`Query returned ${result.recordset.length} schedules`);
  
  // Group by day_of_week
  const grouped = new Map<number, Schedule[]>();
  for (let i = 0; i <= 6; i++) {
    grouped.set(i, []);
  }
  
  for (const schedule of result.recordset) {
    const day = schedule.day_of_week;
    grouped.get(day)!.push(schedule);
  }

  return grouped;
};
