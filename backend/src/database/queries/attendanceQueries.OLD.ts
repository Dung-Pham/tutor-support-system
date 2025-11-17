/**
 * File: database/queries/attendanceQueries.ts
 * Purpose: Database queries for Attendance management
 */

import dbConnection from '../connection';
import { AttendanceRecord } from '../../types';

/**
 * Create or get attendance record
 * @param scheduleId Schedule ID
 * @returns Promise<AttendanceRecord>
 */
export const getOrCreateAttendance = async (scheduleId: number): Promise<AttendanceRecord> => {
  // First, try to get existing attendance
  const selectQuery = `
    SELECT * FROM AttendanceRecord
    WHERE scheduleId = @scheduleId
  `;

  const existingResult = await dbConnection.query<AttendanceRecord>(selectQuery, { scheduleId });

  if (existingResult.recordset.length > 0) {
    return existingResult.recordset[0];
  }

  // Create new attendance record
  const insertQuery = `
    INSERT INTO AttendanceRecord (
      scheduleId, tutorConfirmed, parentConfirmed, 
      tutorConfirmedAt, parentConfirmedAt, status, createdAt, updatedAt
    )
    OUTPUT INSERTED.*
    VALUES (
      @scheduleId, 0, 0, NULL, NULL, 'pending', GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<AttendanceRecord>(insertQuery, { scheduleId });
  return result.recordset[0];
};

/**
 * Confirm attendance by tutor or parent
 * @param attendanceId Attendance ID
 * @param confirmedBy Who is confirming ('tutor' or 'parent')
 * @returns Promise<AttendanceRecord>
 */
export const confirmAttendance = async (
  attendanceId: number,
  confirmedBy: 'tutor' | 'parent'
): Promise<AttendanceRecord> => {
  const field = confirmedBy === 'tutor' ? 'tutorConfirmed' : 'parentConfirmed';
  const dateField = confirmedBy === 'tutor' ? 'tutorConfirmedAt' : 'parentConfirmedAt';

  const query = `
    UPDATE AttendanceRecord
    SET ${field} = 1,
        ${dateField} = GETDATE(),
        status = CASE 
          WHEN tutorConfirmed = 1 AND parentConfirmed = 1 THEN 'confirmed'
          WHEN ${field} = 1 THEN 'partially_confirmed'
          ELSE 'pending'
        END,
        updatedAt = GETDATE()
    OUTPUT INSERTED.*
    WHERE id = @attendanceId
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, { attendanceId });
  return result.recordset[0];
};

/**
 * Get attendance by ID
 * @param attendanceId Attendance ID
 * @returns Promise<AttendanceRecord | null>
 */
export const getAttendanceById = async (attendanceId: number): Promise<AttendanceRecord | null> => {
  const query = `
    SELECT ar.*,
           s.startTime, s.endTime,
           tr.tutorId, tr.studentId
    FROM AttendanceRecord ar
    LEFT JOIN Schedule s ON ar.scheduleId = s.id
    LEFT JOIN TutorRequest tr ON s.tutorRequestId = tr.id
    WHERE ar.id = @attendanceId
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, { attendanceId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get attendance history for a schedule
 * @param scheduleId Schedule ID
 * @returns Promise<AttendanceRecord[]>
 */
export const getAttendanceHistory = async (scheduleId: number): Promise<AttendanceRecord[]> => {
  const query = `
    SELECT ar.*
    FROM AttendanceRecord ar
    WHERE ar.scheduleId = @scheduleId
    ORDER BY ar.createdAt DESC
  `;

  const result = await dbConnection.query<AttendanceRecord>(query, { scheduleId });
  return result.recordset;
};

/**
 * Get attendance records for a user
 * @param userId User ID
 * @param userRole User role ('tutor' or 'student')
 * @param filters Optional filters
 * @returns Promise<AttendanceRecord[]>
 */
export const getAttendanceByUser = async (
  userId: number,
  userRole: 'tutor' | 'student',
  filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<{ attendance: AttendanceRecord[]; total: number }> => {
  const userFilter = userRole === 'tutor' ? 'tr.tutorId' : 'tr.studentId';
  let whereConditions: string[] = [`${userFilter} = @userId`];
  const params: Record<string, any> = { userId };

  if (filters?.status) {
    whereConditions.push('ar.status = @status');
    params.status = filters.status;
  }

  if (filters?.startDate) {
    whereConditions.push('s.startTime >= @startDate');
    params.startDate = filters.startDate;
  }

  if (filters?.endDate) {
    whereConditions.push('s.endTime <= @endDate');
    params.endDate = filters.endDate;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM AttendanceRecord ar
    INNER JOIN Schedule s ON ar.scheduleId = s.id
    INNER JOIN TutorRequest tr ON s.tutorRequestId = tr.id
    WHERE ${whereClause}
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, params);
  const total = countResult.recordset[0].total;

  // Get attendance records
  const query = `
    SELECT ar.*,
           s.startTime, s.endTime,
           tr.tutorId, tr.studentId,
           u1.name as tutorName, u2.name as studentName
    FROM AttendanceRecord ar
    INNER JOIN Schedule s ON ar.scheduleId = s.id
    INNER JOIN TutorRequest tr ON s.tutorRequestId = tr.id
    LEFT JOIN [User] u1 ON tr.tutorId = u1.id
    LEFT JOIN [User] u2 ON tr.studentId = u2.id
    WHERE ${whereClause}
    ORDER BY s.startTime DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  params.limit = filters?.limit || 20;
  params.offset = filters?.offset || 0;

  const result = await dbConnection.query<AttendanceRecord>(query, params);

  return {
    attendance: result.recordset,
    total,
  };
};

/**
 * Get attendance statistics for a user
 * @param userId User ID
 * @param userRole User role ('tutor' or 'student')
 * @param startDate Start date filter
 * @param endDate End date filter
 * @returns Promise<Object>
 */
export const getAttendanceStatistics = async (
  userId: number,
  userRole: 'tutor' | 'student',
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number;
  confirmed: number;
  partiallyConfirmed: number;
  pending: number;
  confirmationRate: number;
}> => {
  const userFilter = userRole === 'tutor' ? 'tr.tutorId' : 'tr.studentId';
  let whereConditions: string[] = [`${userFilter} = @userId`];
  const params: Record<string, any> = { userId };

  if (startDate) {
    whereConditions.push('s.startTime >= @startDate');
    params.startDate = startDate;
  }

  if (endDate) {
    whereConditions.push('s.endTime <= @endDate');
    params.endDate = endDate;
  }

  const whereClause = whereConditions.join(' AND ');

  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN ar.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
      SUM(CASE WHEN ar.status = 'partially_confirmed' THEN 1 ELSE 0 END) as partiallyConfirmed,
      SUM(CASE WHEN ar.status = 'pending' THEN 1 ELSE 0 END) as pending
    FROM AttendanceRecord ar
    INNER JOIN Schedule s ON ar.scheduleId = s.id
    INNER JOIN TutorRequest tr ON s.tutorRequestId = tr.id
    WHERE ${whereClause}
  `;

  const result = await dbConnection.query<{
    total: number;
    confirmed: number;
    partiallyConfirmed: number;
    pending: number;
  }>(query, params);

  const stats = result.recordset[0];
  const confirmationRate = stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0;

  return {
    ...stats,
    confirmationRate: Math.round(confirmationRate * 100) / 100,
  };
};

/**
 * Delete attendance record
 * @param attendanceId Attendance ID
 * @returns Promise<boolean>
 */
export const deleteAttendance = async (attendanceId: number): Promise<boolean> => {
  const query = `
    DELETE FROM AttendanceRecord
    WHERE id = @attendanceId
  `;

  const result = await dbConnection.query(query, { attendanceId });
  return result.rowsAffected[0] > 0;
};
