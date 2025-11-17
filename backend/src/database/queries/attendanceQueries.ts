/**
 * File: database/queries/attendanceQueries.ts
 * Purpose: Database queries for Attendance management
 * Schema: Matches SQLTSSupportServer.sql
 */

import dbConnection from '../connection';

/**
 * AttendanceRecord interface matching actual SQL schema
 */
export interface AttendanceRecord {
  attendance_id: string; // UNIQUEIDENTIFIER
  schedule_id: string;
  class_id: string;
  attendance_date: Date;
  tutor_confirmed: boolean; // BIT
  tutor_confirmed_at?: Date;
  tutor_notes?: string;
  user_confirmed: boolean; // BIT - USER confirmation (parent or student)
  user_confirmed_at?: Date;
  user_notes?: string;
  overall_status: string; // 'PENDING', 'CONFIRMED', 'ABSENT', 'CANCELLED'
  created_at: Date;
  updated_at?: Date;
}

export interface CreateAttendanceDTO {
  schedule_id: string;
  class_id: string;
  attendance_date: Date | string;
}

export interface ConfirmAttendanceDTO {
  confirmed_by: 'tutor' | 'user'; // Changed from 'parent' to 'user'
  notes?: string;
}

/**
 * Create or get attendance record
 */
export const getOrCreateAttendance = async (scheduleId: string): Promise<AttendanceRecord> => {
  // First, try to get existing attendance
  const selectQuery = `
    SELECT * FROM [AttendanceRecord]
    WHERE schedule_id = @scheduleId
  `;

  const existingResult = await dbConnection.query<AttendanceRecord>(selectQuery, { scheduleId });

  if (existingResult.recordset.length > 0) {
    return existingResult.recordset[0];
  }

  // Get schedule info to create attendance
  const scheduleQuery = `
    SELECT class_id, start_date
    FROM [Schedule]
    WHERE schedule_id = @scheduleId
  `;

  const scheduleResult = await dbConnection.query<{ class_id: string; start_date: Date }>(
    scheduleQuery,
    { scheduleId }
  );

  if (scheduleResult.recordset.length === 0) {
    throw new Error('Schedule not found');
  }

  const schedule = scheduleResult.recordset[0];

  // Create new attendance record
  const insertQuery = `
    INSERT INTO [AttendanceRecord] (
      schedule_id, class_id, attendance_date,
      tutor_confirmed, user_confirmed,
      overall_status, created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @schedule_id, @class_id, @attendance_date,
      0, 0, 'PENDING', GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<AttendanceRecord>(insertQuery, {
    schedule_id: scheduleId,
    class_id: schedule.class_id,
    attendance_date: schedule.start_date,
  });

  return result.recordset[0];
};

/**
 * Confirm attendance by tutor or parent
 */
export const confirmAttendance = async (
  attendanceId: string,
  confirmedBy: 'tutor' | 'user',
  notes?: string
): Promise<AttendanceRecord> => {
  const now = new Date().toISOString();

  let updateFields: string[] = [];
  const params: Record<string, any> = { attendanceId, notes: notes || null };

  if (confirmedBy === 'tutor') {
    updateFields.push('tutor_confirmed = 1');
    updateFields.push('tutor_confirmed_at = @confirmed_at');
    updateFields.push('tutor_notes = @notes');
  } else if (confirmedBy === 'user') {
    updateFields.push('user_confirmed = 1');
    updateFields.push('user_confirmed_at = @confirmed_at');
    updateFields.push('user_notes = @notes');
  }

  params.confirmed_at = now;

  // Check if both confirmed to update overall_status
  const checkQuery = `
    SELECT tutor_confirmed, user_confirmed
    FROM [AttendanceRecord]
    WHERE attendance_id = @attendanceId
  `;

  const checkResult = await dbConnection.query<{
    tutor_confirmed: boolean;
    user_confirmed: boolean;
  }>(checkQuery, { attendanceId });

  if (checkResult.recordset.length === 0) {
    throw new Error('Attendance record not found');
  }

  const current = checkResult.recordset[0];
  const willBothBeConfirmed =
    (confirmedBy === 'tutor' || current.tutor_confirmed) &&
    (confirmedBy === 'user' || current.user_confirmed);

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
           s.start_date, s.end_date,
           c.[name] as class_name,
           u1.[name] as tutor_name,
           u2.[name] as user_name
    FROM [AttendanceRecord] ar
    LEFT JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    LEFT JOIN [Class] c ON ar.class_id = c.class_id
    LEFT JOIN [UserAccount] u1 ON s.tutor_id = u1.user_id
    LEFT JOIN [UserAccount] u2 ON s.user_id = u2.user_id
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
    SELECT *
    FROM [AttendanceRecord]
    WHERE schedule_id = @scheduleId
    ORDER BY attendance_date DESC
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, { scheduleId });
  return result.recordset;
};

/**
 * Get attendance records by user (tutor or student)
 */
export const getAttendanceByUser = async (filters: {
  user_id: string;
  role: 'tutor' | 'user'; // Changed from 'student' to 'user'
  class_id?: string;
  status?: string;
  start_date?: Date | string;
  end_date?: Date | string;
  limit?: number;
  offset?: number;
}): Promise<{ records: AttendanceRecord[]; total: number }> => {
  const userFilter = filters.role === 'tutor' ? 's.tutor_id' : 's.user_id';
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
    whereConditions.push('ar.attendance_date >= @start_date');
    params.start_date = filters.start_date;
  }

  if (filters.end_date) {
    whereConditions.push('ar.attendance_date <= @end_date');
    params.end_date = filters.end_date;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    WHERE ${whereClause}
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, params);
  const total = countResult.recordset[0].total;

  // Get records
  const query = `
    SELECT ar.*,
           s.start_date, s.end_date,
           c.[name] as class_name,
           u1.[name] as tutor_name,
           u2.[name] as user_name
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    LEFT JOIN [Class] c ON ar.class_id = c.class_id
    LEFT JOIN [UserAccount] u1 ON s.tutor_id = u1.user_id
    LEFT JOIN [UserAccount] u2 ON s.user_id = u2.user_id
    WHERE ${whereClause}
    ORDER BY ar.attendance_date DESC
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
  role: 'tutor' | 'user',
  classId?: string
): Promise<{
  total_sessions: number;
  confirmed_sessions: number;
  pending_sessions: number;
  disputed_sessions: number;
  confirmation_rate: number;
}> => {
  const userFilter = role === 'tutor' ? 's.tutor_id' : 's.user_id';
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
      SUM(CASE WHEN ar.overall_status = 'DISPUTED' THEN 1 ELSE 0 END) as disputed_sessions,
      CASE 
        WHEN COUNT(*) > 0 
        THEN CAST(SUM(CASE WHEN ar.overall_status = 'CONFIRMED' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100
        ELSE 0
      END as confirmation_rate
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    WHERE ${whereClause}
  `;

  const result = await dbConnection.query<{
    total_sessions: number;
    confirmed_sessions: number;
    pending_sessions: number;
    disputed_sessions: number;
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
           s.start_date, s.end_date,
           c.[name] as class_name
    FROM [AttendanceRecord] ar
    INNER JOIN [Schedule] s ON ar.schedule_id = s.schedule_id
    LEFT JOIN [Class] c ON ar.class_id = c.class_id
    WHERE ar.class_id = @classId
      AND ar.overall_status = 'PENDING'
    ORDER BY ar.attendance_date DESC
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, {
    classId,
    limit: limit || 10,
  });

  return result.recordset;
};
