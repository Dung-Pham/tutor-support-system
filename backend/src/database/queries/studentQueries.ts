/**
 * File: database/queries/studentQueries.ts
 * Purpose: Database queries for Student management (Tutor's students list)
 * Schema: Uses Class, UserAccount, Subjects tables
 */

import dbConnection from '../connection';

/**
 * Student with class info interface
 */
export interface TutorStudent {
  student_id: string;
  student_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  status: string;
  classes: {
    class_id: string;
    subject_name: string;
    grade_level: number;
    status: string;
    start_date: Date;
    end_date: Date;
  }[];
  total_classes: number;
  active_classes: number;
}

/**
 * Get all students of a tutor with their class info
 */
export const getTutorStudents = async (tutorId: string): Promise<TutorStudent[]> => {
  // First, get all unique students
  const studentsQuery = `
    SELECT DISTINCT
      u.user_id as student_id,
      u.name as student_name,
      u.email,
      u.phone,
      u.status,
      (SELECT COUNT(*) FROM [Class] WHERE tutor_id = @tutorId AND student_id = u.user_id) as total_classes,
      (SELECT COUNT(*) FROM [Class] WHERE tutor_id = @tutorId AND student_id = u.user_id AND status = 'active') as active_classes
    FROM [UserAccount] u
    INNER JOIN [Class] c ON c.student_id = u.user_id
    WHERE c.tutor_id = @tutorId
    ORDER BY u.name ASC
  `;

  const studentsResult = await dbConnection.query<any>(studentsQuery, { tutorId });
  
  if (studentsResult.recordset.length === 0) {
    return [];
  }

  // Get classes for each student
  const classesQuery = `
    SELECT 
      c.class_id,
      c.student_id,
      c.status,
      c.grade_level,
      c.start_date,
      c.end_date,
      s.name as subject_name
    FROM [Class] c
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    WHERE c.tutor_id = @tutorId
    ORDER BY c.status DESC, c.start_date DESC
  `;

  const classesResult = await dbConnection.query<any>(classesQuery, { tutorId });

  // Group classes by student
  const classesMap: Record<string, any[]> = {};
  for (const cls of classesResult.recordset) {
    if (!classesMap[cls.student_id]) {
      classesMap[cls.student_id] = [];
    }
    classesMap[cls.student_id].push({
      class_id: cls.class_id,
      subject_name: cls.subject_name,
      grade_level: cls.grade_level,
      status: cls.status,
      start_date: cls.start_date,
      end_date: cls.end_date,
    });
  }

  // Combine students with their classes
  const students: TutorStudent[] = studentsResult.recordset.map((student: any) => ({
    student_id: student.student_id,
    student_name: student.student_name,
    email: student.email,
    phone: student.phone,
    status: student.status,
    total_classes: student.total_classes,
    active_classes: student.active_classes,
    classes: classesMap[student.student_id] || [],
  }));

  return students;
};

/**
 * Get single student detail for a tutor
 */
export const getTutorStudentById = async (tutorId: string, studentId: string): Promise<TutorStudent | null> => {
  const studentQuery = `
    SELECT DISTINCT
      u.user_id as student_id,
      u.name as student_name,
      u.email,
      u.phone,
      u.status,
      (SELECT COUNT(*) FROM [Class] WHERE tutor_id = @tutorId AND student_id = u.user_id) as total_classes,
      (SELECT COUNT(*) FROM [Class] WHERE tutor_id = @tutorId AND student_id = u.user_id AND status = 'active') as active_classes
    FROM [UserAccount] u
    INNER JOIN [Class] c ON c.student_id = u.user_id
    WHERE c.tutor_id = @tutorId AND u.user_id = @studentId
  `;

  const studentResult = await dbConnection.query<any>(studentQuery, { tutorId, studentId });
  
  if (studentResult.recordset.length === 0) {
    return null;
  }

  const student = studentResult.recordset[0];

  // Get classes for this student
  const classesQuery = `
    SELECT 
      c.class_id,
      c.status,
      c.grade_level,
      c.start_date,
      c.end_date,
      s.name as subject_name
    FROM [Class] c
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    WHERE c.tutor_id = @tutorId AND c.student_id = @studentId
    ORDER BY c.status DESC, c.start_date DESC
  `;

  const classesResult = await dbConnection.query<any>(classesQuery, { tutorId, studentId });

  return {
    student_id: student.student_id,
    student_name: student.student_name,
    email: student.email,
    phone: student.phone,
    status: student.status,
    total_classes: student.total_classes,
    active_classes: student.active_classes,
    classes: classesResult.recordset.map((cls: any) => ({
      class_id: cls.class_id,
      subject_name: cls.subject_name,
      grade_level: cls.grade_level,
      status: cls.status,
      start_date: cls.start_date,
      end_date: cls.end_date,
    })),
  };
};

/**
 * Search students by name or email
 */
export const searchTutorStudents = async (tutorId: string, searchTerm: string): Promise<TutorStudent[]> => {
  const studentsQuery = `
    SELECT DISTINCT
      u.user_id as student_id,
      u.name as student_name,
      u.email,
      u.phone,
      u.status,
      (SELECT COUNT(*) FROM [Class] WHERE tutor_id = @tutorId AND student_id = u.user_id) as total_classes,
      (SELECT COUNT(*) FROM [Class] WHERE tutor_id = @tutorId AND student_id = u.user_id AND status = 'active') as active_classes
    FROM [UserAccount] u
    INNER JOIN [Class] c ON c.student_id = u.user_id
    WHERE c.tutor_id = @tutorId
      AND (u.name LIKE @search OR u.email LIKE @search)
    ORDER BY u.name ASC
  `;

  const studentsResult = await dbConnection.query<any>(studentsQuery, { 
    tutorId, 
    search: `%${searchTerm}%` 
  });
  
  if (studentsResult.recordset.length === 0) {
    return [];
  }

  // Get classes for all found students
  const studentIds = studentsResult.recordset.map((s: any) => `'${s.student_id}'`).join(',');
  
  const classesQuery = `
    SELECT 
      c.class_id,
      c.student_id,
      c.status,
      c.grade_level,
      c.start_date,
      c.end_date,
      s.name as subject_name
    FROM [Class] c
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    WHERE c.tutor_id = @tutorId AND c.student_id IN (${studentIds})
    ORDER BY c.status DESC, c.start_date DESC
  `;

  const classesResult = await dbConnection.query<any>(classesQuery, { tutorId });

  // Group classes by student
  const classesMap: Record<string, any[]> = {};
  for (const cls of classesResult.recordset) {
    if (!classesMap[cls.student_id]) {
      classesMap[cls.student_id] = [];
    }
    classesMap[cls.student_id].push({
      class_id: cls.class_id,
      subject_name: cls.subject_name,
      grade_level: cls.grade_level,
      status: cls.status,
      start_date: cls.start_date,
      end_date: cls.end_date,
    });
  }

  // Combine students with their classes
  const students: TutorStudent[] = studentsResult.recordset.map((student: any) => ({
    student_id: student.student_id,
    student_name: student.student_name,
    email: student.email,
    phone: student.phone,
    status: student.status,
    total_classes: student.total_classes,
    active_classes: student.active_classes,
    classes: classesMap[student.student_id] || [],
  }));

  return students;
};
