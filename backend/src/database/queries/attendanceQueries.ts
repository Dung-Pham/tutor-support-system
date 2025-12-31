/**
 * File: database/queries/attendanceQueries.ts
 * Purpose: Database queries for Attendance management
 * Schema: Matches tutorsupportdb_merged-v2.sql
 * 
 * AttendanceRecord table fields:
 * - attendance_id (UNIQUEIDENTIFIER)
 * - class_id (UNIQUEIDENTIFIER) - FK to Class
 * - schedule_id (UNIQUEIDENTIFIER) - FK to Schedule
 * - session_date (date) - Ngày diễn ra buổi học
 * - tutor_confirmed (bit) - Gia sư xác nhận
 * - tutor_confirmed_at (datetime2)
 * - tutor_notes (nvarchar)
 * - student_confirmed (bit) - Học viên xác nhận
 * - student_confirmed_at (datetime2)
 * - student_notes (nvarchar)
 * - overall_status (varchar) - 'PENDING', 'CONFIRMED', 'ABSENT', 'CANCELLED'
 */

import dbConnection from '../connection';

/**
 * AttendanceRecord interface matching actual SQL schema
 */
export interface AttendanceRecord {
  attendance_id: string;
  class_id: string;
  schedule_id: string;
  session_date: string; // DATE format: YYYY-MM-DD
  tutor_confirmed: boolean;
  tutor_confirmed_at?: Date;
  tutor_notes?: string;
  student_confirmed: boolean; // Changed from user_confirmed
  student_confirmed_at?: Date;
  student_notes?: string; // Changed from user_notes
  overall_status: 'PENDING' | 'CONFIRMED' | 'ABSENT' | 'CANCELLED';
  created_at: Date;
  updated_at?: Date;
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
  session_date: string; // YYYY-MM-DD
}

export interface ConfirmAttendanceDTO {
  confirmed_by: 'tutor' | 'student'; // Changed from 'user' to 'student'
  notes?: string;
}

/**
 * Create or get attendance record for a schedule on specific date
 */
export const getOrCreateAttendance = async (
  scheduleId: string,
  sessionDate: string // YYYY-MM-DD
): Promise<AttendanceRecord> => {
  // First, try to get existing attendance for this schedule and date
  const selectQuery = `
    SELECT ar.*, 
           s.day_of_week, s.start_time, s.end_time,
           t.name as tutor_name,
           st.name as student_name,
           sub.name as subject_name
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    INNER JOIN [Class] c ON ar.class_id = c.class_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    WHERE ar.schedule_id = @scheduleId AND ar.session_date = @sessionDate
  `;

  const existingResult = await dbConnection.query<AttendanceRecord>(selectQuery, { 
    scheduleId,
    sessionDate 
  });

  if (existingResult.recordset.length > 0) {
    return existingResult.recordset[0];
  }

  // Get schedule info to create attendance
  const scheduleQuery = `
    SELECT s.class_id, s.day_of_week, s.start_time, s.end_time,
           c.tutor_id, c.student_id
    FROM [Schedule] s
    INNER JOIN [Class] c ON s.class_id = c.class_id
    WHERE s.schedule_id = @scheduleId
  `;

  const scheduleResult = await dbConnection.query<{ 
    class_id: string; 
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>(scheduleQuery, { scheduleId });

  if (scheduleResult.recordset.length === 0) {
    throw new Error('Schedule not found');
  }

  const schedule = scheduleResult.recordset[0];

  // Create new attendance record
  const insertQuery = `
    INSERT INTO [AttendanceRecord] (
      class_id, schedule_id, session_date,
      tutor_confirmed, student_confirmed,
      overall_status, created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @class_id, @schedule_id, @session_date,
      0, 0, 'PENDING', GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<AttendanceRecord>(insertQuery, {
    class_id: schedule.class_id,
    schedule_id: scheduleId,
    session_date: sessionDate,
  });

  return result.recordset[0];
};

/**
 * Confirm attendance by tutor or student
 */
export const confirmAttendance = async (
  attendanceId: string,
  confirmedBy: 'tutor' | 'student',
  notes?: string
): Promise<AttendanceRecord> => {
  const now = new Date().toISOString();

  let updateFields: string[] = [];
  const params: Record<string, any> = { attendanceId, notes: notes || null };

  if (confirmedBy === 'tutor') {
    updateFields.push('tutor_confirmed = 1');
    updateFields.push('tutor_confirmed_at = @confirmed_at');
    updateFields.push('tutor_notes = @notes');
  } else if (confirmedBy === 'student') {
    updateFields.push('student_confirmed = 1');
    updateFields.push('student_confirmed_at = @confirmed_at');
    updateFields.push('student_notes = @notes');
  }

  params.confirmed_at = now;

  // Check if both confirmed to update overall_status
  const checkQuery = `
    SELECT tutor_confirmed, student_confirmed
    FROM [AttendanceRecord]
    WHERE attendance_id = @attendanceId
  `;

  const checkResult = await dbConnection.query<{
    tutor_confirmed: boolean;
    student_confirmed: boolean;
  }>(checkQuery, { attendanceId });

  if (checkResult.recordset.length === 0) {
    throw new Error('Attendance record not found');
  }

  const current = checkResult.recordset[0];
  const willBothBeConfirmed =
    (confirmedBy === 'tutor' || current.tutor_confirmed) &&
    (confirmedBy === 'student' || current.student_confirmed);

  if (willBothBeConfirmed) {
    updateFields.push("overall_status = 'CONFIRMED'");
  }

  updateFields.push('updated_at = GETDATE()');

  const query = `
    UPDATE [AttendanceRecord]
    SET ${updateFields.join(', ')}
    OUTPUT INSERTED.*
    WHERE attendance_id = @attendanceId
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, params);
  return result.recordset[0];
};

/**
 * Get attendance by ID
 */
export const getAttendanceById = async (attendanceId: string): Promise<AttendanceRecord | null> => {
  const query = `
    SELECT ar.*,
           s.day_of_week, s.start_time, s.end_time,
           t.name as tutor_name,
           st.name as student_name,
           sub.name as subject_name
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    INNER JOIN [Class] c ON ar.class_id = c.class_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    WHERE ar.attendance_id = @attendanceId
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, { attendanceId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get attendance history for a schedule
 */
export const getAttendanceHistory = async (scheduleId: string): Promise<AttendanceRecord[]> => {
  const query = `
    SELECT ar.*,
           s.day_of_week, s.start_time, s.end_time,
           t.name as tutor_name,
           st.name as student_name,
           sub.name as subject_name
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    INNER JOIN [Class] c ON ar.class_id = c.class_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    WHERE ar.schedule_id = @scheduleId
    ORDER BY ar.session_date DESC
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, { scheduleId });
  return result.recordset;
};

/**
 * Get attendance by schedule and date
 */
export const getAttendanceByScheduleAndDate = async (
  scheduleId: string,
  sessionDate: string
): Promise<AttendanceRecord | null> => {
  const query = `
    SELECT ar.*,
           s.day_of_week, s.start_time, s.end_time,
           t.name as tutor_name,
           st.name as student_name,
           sub.name as subject_name
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    INNER JOIN [Class] c ON ar.class_id = c.class_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    WHERE ar.schedule_id = @scheduleId AND ar.session_date = @sessionDate
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, { scheduleId, sessionDate });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get attendance records by user (tutor or student)
 */
export const getAttendanceByUser = async (filters: {
  user_id: string;
  role: 'tutor' | 'student'; // Changed from 'user' to 'student'
  class_id?: string;
  status?: string;
  start_date?: Date | string;
  end_date?: Date | string;
  limit?: number;
  offset?: number;
}): Promise<{ records: AttendanceRecord[]; total: number }> => {
  const userFilter = filters.role === 'tutor' ? 'c.tutor_id' : 'c.student_id';
  let whereConditions: string[] = [`${userFilter} = @user_id`];
  const params: Record<string, any> = { user_id: filters.user_id };

  if (filters.class_id) {
    whereConditions.push('ar.class_id = @class_id');
    params.class_id = filters.class_id;
  }

  if (filters.status) {
    whereConditions.push('ar.overall_status = @status');
    params.status = filters.status;
  }

  if (filters.start_date) {
    whereConditions.push('ar.session_date >= @start_date');
    params.start_date = filters.start_date;
  }

  if (filters.end_date) {
    whereConditions.push('ar.session_date <= @end_date');
    params.end_date = filters.end_date;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    INNER JOIN [Class] c ON ar.class_id = c.class_id
    WHERE ${whereClause}
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, params);
  const total = countResult.recordset[0].total;

  // Get records
  const query = `
    SELECT ar.*,
           s.day_of_week, s.start_time, s.end_time,
           t.name as tutor_name,
           st.name as student_name,
           sub.name as subject_name
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    INNER JOIN [Class] c ON ar.class_id = c.class_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    WHERE ${whereClause}
    ORDER BY ar.session_date DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  params.limit = filters.limit || 20;
  params.offset = filters.offset || 0;

  const result = await dbConnection.query<AttendanceRecord>(query, params);

  return {
    records: result.recordset,
    total,
  };
};

/**
 * Get attendance statistics for a user
 */
export const getAttendanceStatistics = async (
  userId: string,
  role: 'tutor' | 'student',
  classId?: string
): Promise<{
  total_sessions: number;
  confirmed_sessions: number;
  pending_sessions: number;
  absent_sessions: number;
  confirmation_rate: number;
}> => {
  const userFilter = role === 'tutor' ? 'c.tutor_id' : 'c.student_id';
  let whereConditions: string[] = [`${userFilter} = @userId`];
  const params: Record<string, any> = { userId };

  if (classId) {
    whereConditions.push('ar.class_id = @classId');
    params.classId = classId;
  }

  const whereClause = whereConditions.join(' AND ');

  const query = `
    SELECT 
      COUNT(*) as total_sessions,
      SUM(CASE WHEN ar.overall_status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_sessions,
      SUM(CASE WHEN ar.overall_status = 'PENDING' THEN 1 ELSE 0 END) as pending_sessions,
      SUM(CASE WHEN ar.overall_status = 'ABSENT' THEN 1 ELSE 0 END) as absent_sessions,
      CASE 
        WHEN COUNT(*) > 0 
        THEN CAST(SUM(CASE WHEN ar.overall_status = 'CONFIRMED' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100
        ELSE 0
      END as confirmation_rate
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    INNER JOIN [Class] c ON ar.class_id = c.class_id
    WHERE ${whereClause}
  `;

  const result = await dbConnection.query<{
    total_sessions: number;
    confirmed_sessions: number;
    pending_sessions: number;
    absent_sessions: number;
    confirmation_rate: number;
  }>(query, params);

  return result.recordset[0];
};

/**
 * Delete attendance record
 */
export const deleteAttendance = async (attendanceId: string): Promise<boolean> => {
  const query = `
    DELETE FROM [AttendanceRecord]
    WHERE attendance_id = @attendanceId
  `;

  const result = await dbConnection.query(query, { attendanceId });
  return result.rowsAffected[0] > 0;
};

/**
 * Update attendance status
 */
export const updateAttendanceStatus = async (
  attendanceId: string,
  status: string
): Promise<AttendanceRecord> => {
  const query = `
    UPDATE [AttendanceRecord]
    SET overall_status = @status,
        updated_at = GETDATE()
    OUTPUT INSERTED.*
    WHERE attendance_id = @attendanceId
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, {
    attendanceId,
    status,
  });

  return result.recordset[0];
};

/**
 * Get pending confirmations for a class
 */
export const getPendingConfirmations = async (
  classId: string,
  limit?: number
): Promise<AttendanceRecord[]> => {
  const query = `
    SELECT TOP (@limit) ar.*,
           s.day_of_week, s.start_time, s.end_time,
           t.name as tutor_name,
           st.name as student_name,
           sub.name as subject_name
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    INNER JOIN [Class] c ON ar.class_id = c.class_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    WHERE ar.class_id = @classId
      AND ar.overall_status = 'PENDING'
    ORDER BY ar.session_date DESC
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, {
    classId,
    limit: limit || 10,
  });

  return result.recordset;
};

/**
 * Get attendance records by class and date range
 */
export const getAttendanceByClassAndDateRange = async (
  classId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> => {
  const query = `
    SELECT ar.*,
           s.day_of_week, s.start_time, s.end_time,
           t.name as tutor_name,
           st.name as student_name,
           sub.name as subject_name
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    INNER JOIN [Class] c ON ar.class_id = c.class_id
    LEFT JOIN [UserAccount] t ON c.tutor_id = t.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
    WHERE ar.class_id = @classId
      AND ar.session_date >= @startDate
      AND ar.session_date <= @endDate
    ORDER BY ar.session_date ASC
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, {
    classId,
    startDate,
    endDate,
  });

  return result.recordset;
};
