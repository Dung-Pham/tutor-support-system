/**
 * File: database/queries/classQueries.ts
 * Purpose: Database queries for Class management
 * Schema: Matches tutorsupportdb_merged.sql
 * 
 * Class table fields:
 * - class_id (UNIQUEIDENTIFIER)
 * - student_id (UNIQUEIDENTIFIER) - FK to UserAccount
 * - tutor_id (UNIQUEIDENTIFIER) - FK to UserAccount, nullable
 * - subject_id (UNIQUEIDENTIFIER) - FK to Subjects
 * - description (NVARCHAR)
 * - requirement (NVARCHAR)
 * - hourly_price (BIGINT)
 * - grade_level (SMALLINT)
 * - start_date (DATE)
 * - end_date (DATE)
 * - sessions_per_week (INT)
 * - status ('recruiting', 'active', 'completed', 'cancelled')
 * - is_locked (BIT)
 * - created_at (DATETIME2)
 * - updated_at (DATETIME2)
 */

import dbConnection from '../connection';

export interface ClassRecord {
  class_id: string;
  student_id: string;
  tutor_id: string | null;
  subject_id: string;
  description: string;
  requirement: string;
  hourly_price: number;
  grade_level: number;
  start_date: Date;
  end_date: Date;
  sessions_per_week: number;
  status: string; // 'recruiting' | 'active' | 'completed' | 'cancelled'
  is_locked: boolean;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  subject_name?: string;
  tutor_name?: string;
  student_name?: string;
}

/**
 * Get all classes for a student (as student)
 */
export const getClassesByStudent = async (studentId: string): Promise<ClassRecord[]> => {
  const query = `
    SELECT 
      c.class_id,
      c.student_id,
      c.tutor_id,
      c.subject_id,
      c.description,
      c.requirement,
      c.hourly_price,
      c.grade_level,
      c.start_date,
      c.end_date,
      c.sessions_per_week,
      c.status,
      c.is_locked,
      c.created_at,
      c.updated_at,
      s.name as subject_name,
      tu.name as tutor_name,
      st.name as student_name
    FROM [Class] c
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    LEFT JOIN [UserAccount] tu ON c.tutor_id = tu.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE c.student_id = @studentId
    ORDER BY c.created_at DESC
  `;

  const result = await dbConnection.query<ClassRecord>(query, { studentId });
  return result.recordset;
};

/**
 * Get all classes for a tutor (as tutor)
 */
export const getClassesByTutor = async (tutorId: string): Promise<ClassRecord[]> => {
  const query = `
    SELECT 
      c.class_id,
      c.student_id,
      c.tutor_id,
      c.subject_id,
      c.description,
      c.requirement,
      c.hourly_price,
      c.grade_level,
      c.start_date,
      c.end_date,
      c.sessions_per_week,
      c.status,
      c.is_locked,
      c.created_at,
      c.updated_at,
      s.name as subject_name,
      tu.name as tutor_name,
      st.name as student_name
    FROM [Class] c
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    LEFT JOIN [UserAccount] tu ON c.tutor_id = tu.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE c.tutor_id = @tutorId
    ORDER BY c.created_at DESC
  `;

  const result = await dbConnection.query<ClassRecord>(query, { tutorId });
  return result.recordset;
};

/**
 * Get class by ID with all related info
 */
export const getClassById = async (classId: string): Promise<ClassRecord | null> => {
  const query = `
    SELECT 
      c.class_id,
      c.student_id,
      c.tutor_id,
      c.subject_id,
      c.description,
      c.requirement,
      c.hourly_price,
      c.grade_level,
      c.start_date,
      c.end_date,
      c.sessions_per_week,
      c.status,
      c.is_locked,
      c.created_at,
      c.updated_at,
      s.name as subject_name,
      tu.name as tutor_name,
      st.name as student_name
    FROM [Class] c
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    LEFT JOIN [UserAccount] tu ON c.tutor_id = tu.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE c.class_id = @classId
  `;

  const result = await dbConnection.query<ClassRecord>(query, { classId });
  return result.recordset[0] || null;
};

/**
 * Get active classes (for calendar/schedule view)
 */
export const getActiveClasses = async (userId: string, userRole: 'tutor' | 'student'): Promise<ClassRecord[]> => {
  const userFilter = userRole === 'tutor' ? 'c.tutor_id' : 'c.student_id';

  const query = `
    SELECT 
      c.class_id,
      c.student_id,
      c.tutor_id,
      c.subject_id,
      c.description,
      c.requirement,
      c.hourly_price,
      c.grade_level,
      c.start_date,
      c.end_date,
      c.sessions_per_week,
      c.status,
      c.is_locked,
      c.created_at,
      c.updated_at,
      s.name as subject_name,
      tu.name as tutor_name,
      st.name as student_name
    FROM [Class] c
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    LEFT JOIN [UserAccount] tu ON c.tutor_id = tu.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE ${userFilter} = @userId
      AND c.status IN ('active', 'recruiting')
      AND c.start_date <= CAST(GETDATE() AS DATE)
      AND c.end_date >= CAST(GETDATE() AS DATE)
    ORDER BY c.start_date ASC
  `;

  const result = await dbConnection.query<ClassRecord>(query, { userId });
  return result.recordset;
};

/**
 * Get classes with schedule info
 */
export const getClassesWithSchedules = async (userId: string, userRole: 'tutor' | 'student'): Promise<any[]> => {
  const userFilter = userRole === 'tutor' ? 'c.tutor_id' : 'c.student_id';

  const query = `
    SELECT 
      c.class_id,
      c.student_id,
      c.tutor_id,
      c.subject_id,
      c.description,
      c.requirement,
      c.hourly_price,
      c.grade_level,
      c.start_date,
      c.end_date,
      c.sessions_per_week,
      c.status,
      c.is_locked,
      c.created_at,
      c.updated_at,
      s.name as subject_name,
      tu.name as tutor_name,
      st.name as student_name,
      (SELECT COUNT(*) FROM [Schedule] WHERE class_id = c.class_id AND is_active = 1) as schedule_count
    FROM [Class] c
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    LEFT JOIN [UserAccount] tu ON c.tutor_id = tu.user_id
    LEFT JOIN [UserAccount] st ON c.student_id = st.user_id
    WHERE ${userFilter} = @userId
    ORDER BY c.status DESC, c.start_date DESC
  `;

  const result = await dbConnection.query<any>(query, { userId });
  return result.recordset;
};
