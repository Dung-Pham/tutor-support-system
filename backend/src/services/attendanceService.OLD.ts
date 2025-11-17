/**
 * File: services/attendanceService.ts
 * Mục đích: Business logic cho attendance & confirmation
 * Vai trò: Handle 2-way attendance confirmation, status updates, history
 */

import {
  AttendanceRecord,
  UpdateAttendanceDTO,
  ConfirmAttendanceDTO,
  AttendanceStatus
} from '../types';
import { executeQuery } from '../utils/database';
import { QueryTypes } from 'sequelize';

/**
 * Create or get attendance record for a schedule
 */
export const getOrCreateAttendance = async (scheduleId: number): Promise<AttendanceRecord> => {
  // Check if attendance record exists
  const existingQuery = `
    SELECT *
    FROM AttendanceRecord
    WHERE scheduleId = :scheduleId
  `;
  
  const existing = await executeQuery<AttendanceRecord[]>(existingQuery, { scheduleId });
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Get schedule details to create attendance
  const scheduleQuery = `
    SELECT tutorId, studentId
    FROM Schedule
    WHERE scheduleId = :scheduleId
  `;
  
  const schedules = await executeQuery<any[]>(scheduleQuery, { scheduleId });
  
  if (schedules.length === 0) {
    throw new Error('Schedule not found');
  }
  
  const schedule = schedules[0];
  
  // Create attendance record
  const insertQuery = `
    INSERT INTO AttendanceRecord (scheduleId, studentId, tutorId, status, tutorConfirmed, parentConfirmed, createdAt, updatedAt)
    OUTPUT INSERTED.*
    VALUES (:scheduleId, :studentId, :tutorId, 'pending', 0, 0, GETDATE(), GETDATE())
  `;
  
  const result = await executeQuery<AttendanceRecord[]>(insertQuery, {
    scheduleId,
    studentId: schedule.studentId,
    tutorId: schedule.tutorId
  }, QueryTypes.INSERT);
  
  return result[0];
};

/**
 * Get attendance by ID
 */
export const getAttendanceById = async (attendanceId: number): Promise<AttendanceRecord | null> => {
  const query = `
    SELECT a.*,
           s.startTime, s.endTime,
           t.fullName as tutorName,
           st.fullName as studentName,
           sub.subjectName
    FROM AttendanceRecord a
    JOIN Schedule s ON a.scheduleId = s.scheduleId
    JOIN [User] t ON a.tutorId = t.userId
    JOIN [User] st ON a.studentId = st.userId
    JOIN Subject sub ON s.subjectId = sub.subjectId
    WHERE a.attendanceId = :attendanceId
  `;
  
  const result = await executeQuery<any[]>(query, { attendanceId });
  return result.length > 0 ? result[0] : null;
};

/**
 * Update attendance status
 */
export const updateAttendance = async (
  attendanceId: number,
  data: UpdateAttendanceDTO
): Promise<AttendanceRecord> => {
  const updates: string[] = [];
  const params: Record<string, any> = { attendanceId };
  
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
    UPDATE AttendanceRecord
    SET ${updates.join(', ')}
    OUTPUT INSERTED.*
    WHERE attendanceId = :attendanceId
  `;
  
  const result = await executeQuery<AttendanceRecord[]>(query, params, QueryTypes.UPDATE);
  
  if (result.length === 0) {
    throw new Error('Attendance record not found');
  }
  
  return result[0];
};

/**
 * Confirm attendance (2-way confirmation)
 */
export const confirmAttendance = async (
  attendanceId: number,
  data: ConfirmAttendanceDTO
): Promise<AttendanceRecord> => {
  const attendance = await getAttendanceById(attendanceId);
  
  if (!attendance) {
    throw new Error('Attendance record not found');
  }
  
  let query = '';
  
  if (data.confirmedBy === 'tutor') {
    query = `
      UPDATE AttendanceRecord
      SET tutorConfirmed = 1,
          tutorConfirmedAt = GETDATE(),
          updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE attendanceId = :attendanceId
    `;
  } else if (data.confirmedBy === 'parent') {
    query = `
      UPDATE AttendanceRecord
      SET parentConfirmed = 1,
          parentConfirmedAt = GETDATE(),
          updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE attendanceId = :attendanceId
    `;
  } else {
    throw new Error('Invalid confirmedBy value');
  }
  
  const result = await executeQuery<AttendanceRecord[]>(query, { attendanceId }, QueryTypes.UPDATE);
  return result[0];
};

/**
 * Get attendance history for a student
 */
export const getAttendanceHistory = async (
  studentId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ items: AttendanceRecord[]; totalItems: number }> => {
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT a.*,
           s.startTime, s.endTime,
           t.fullName as tutorName,
           sub.subjectName
    FROM AttendanceRecord a
    JOIN Schedule s ON a.scheduleId = s.scheduleId
    JOIN [User] t ON a.tutorId = t.userId
    JOIN Subject sub ON s.subjectId = sub.subjectId
    WHERE a.studentId = :studentId
    ORDER BY s.startTime DESC
    OFFSET :offset ROWS
    FETCH NEXT :limit ROWS ONLY
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM AttendanceRecord
    WHERE studentId = :studentId
  `;
  
  const items = await executeQuery<AttendanceRecord[]>(query, { studentId, offset, limit });
  const countResult = await executeQuery<[{ total: number }]>(countQuery, { studentId });
  
  return {
    items,
    totalItems: countResult[0]?.total || 0
  };
};

/**
 * Get attendance statistics for a student
 */
export const getAttendanceStats = async (studentId: number, subjectId?: number): Promise<any> => {
  let whereClause = 'WHERE a.studentId = :studentId';
  const params: Record<string, any> = { studentId };
  
  if (subjectId) {
    whereClause += ' AND s.subjectId = :subjectId';
    params.subjectId = subjectId;
  }
  
  const query = `
    SELECT 
      COUNT(*) as totalClasses,
      SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentCount,
      SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentCount,
      SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as lateCount,
      SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excusedCount,
      CAST(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as attendanceRate
    FROM AttendanceRecord a
    JOIN Schedule s ON a.scheduleId = s.scheduleId
    ${whereClause}
  `;
  
  const result = await executeQuery<any[]>(query, params);
  return result[0] || {};
};

/**
 * Get pending confirmations for a user
 */
export const getPendingConfirmations = async (userId: number, role: string): Promise<AttendanceRecord[]> => {
  let query = '';
  
  if (role === 'tutor') {
    query = `
      SELECT a.*,
             s.startTime, s.endTime,
             st.fullName as studentName,
             sub.subjectName
      FROM AttendanceRecord a
      JOIN Schedule s ON a.scheduleId = s.scheduleId
      JOIN [User] st ON a.studentId = st.userId
      JOIN Subject sub ON s.subjectId = sub.subjectId
      WHERE a.tutorId = :userId
        AND a.tutorConfirmed = 0
        AND s.endTime < GETDATE()
      ORDER BY s.startTime DESC
    `;
  } else if (role === 'parent') {
    query = `
      SELECT a.*,
             s.startTime, s.endTime,
             t.fullName as tutorName,
             sub.subjectName
      FROM AttendanceRecord a
      JOIN Schedule s ON a.scheduleId = s.scheduleId
      JOIN [User] t ON a.tutorId = t.userId
      JOIN [User] st ON a.studentId = st.userId
      JOIN Subject sub ON s.subjectId = sub.subjectId
      WHERE st.parentId = :userId
        AND a.parentConfirmed = 0
        AND s.endTime < GETDATE()
      ORDER BY s.startTime DESC
    `;
  } else {
    throw new Error('Invalid role for attendance confirmations');
  }
  
  return await executeQuery<AttendanceRecord[]>(query, { userId });
};
