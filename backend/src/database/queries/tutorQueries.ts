/**
 * File: database/queries/tutorQueries.ts
 * Purpose: Database queries for Tutor management (Student's tutors list)
 * Schema: Uses Class, UserAccount, Subjects tables
 */

import dbConnection from '../connection';

/**
 * Tutor with class info interface
 */
export interface StudentTutor {
  tutor_id: string;
  tutor_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
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
 * Get all tutors of a student with their class info
 */
export const getStudentTutors = async (studentId: string): Promise<StudentTutor[]> => {
  // First, get all unique tutors
  const tutorsQuery = `
    SELECT DISTINCT
      u.user_id as tutor_id,
      u.name as tutor_name,
      u.email,
      u.phone,
      u.avatar_url,
      u.bio,
      (SELECT COUNT(*) FROM [Class] WHERE student_id = @studentId AND tutor_id = u.user_id) as total_classes,
      (SELECT COUNT(*) FROM [Class] WHERE student_id = @studentId AND tutor_id = u.user_id AND status = 'active') as active_classes
    FROM [UserAccount] u
    INNER JOIN [Class] c ON c.tutor_id = u.user_id
    WHERE c.student_id = @studentId
    ORDER BY u.name ASC
  `;

  const tutorsResult = await dbConnection.query<any>(tutorsQuery, { studentId });
  
  if (tutorsResult.recordset.length === 0) {
    return [];
  }

  // Get classes for each tutor
  const classesQuery = `
    SELECT 
      c.class_id,
      c.tutor_id,
      c.status,
      c.grade_level,
      c.start_date,
      c.end_date,
      s.name as subject_name
    FROM [Class] c
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    WHERE c.student_id = @studentId
    ORDER BY c.status DESC, c.start_date DESC
  `;

  const classesResult = await dbConnection.query<any>(classesQuery, { studentId });

  // Group classes by tutor
  const classesMap: Record<string, any[]> = {};
  for (const cls of classesResult.recordset) {
    if (!classesMap[cls.tutor_id]) {
      classesMap[cls.tutor_id] = [];
    }
    classesMap[cls.tutor_id].push({
      class_id: cls.class_id,
      subject_name: cls.subject_name,
      grade_level: cls.grade_level,
      status: cls.status,
      start_date: cls.start_date,
      end_date: cls.end_date,
    });
  }

  // Combine tutors with their classes
  const tutors: StudentTutor[] = tutorsResult.recordset.map((tutor: any) => ({
    tutor_id: tutor.tutor_id,
    tutor_name: tutor.tutor_name,
    email: tutor.email,
    phone: tutor.phone,
    avatar_url: tutor.avatar_url,
    bio: tutor.bio,
    total_classes: tutor.total_classes,
    active_classes: tutor.active_classes,
    classes: classesMap[tutor.tutor_id] || [],
  }));

  return tutors;
};

/**
 * Get single tutor detail for a student
 */
export const getStudentTutorById = async (studentId: string, tutorId: string): Promise<StudentTutor | null> => {
  const tutorQuery = `
    SELECT DISTINCT
      u.user_id as tutor_id,
      u.name as tutor_name,
      u.email,
      u.phone,
      u.avatar_url,
      u.bio,
      (SELECT COUNT(*) FROM [Class] WHERE student_id = @studentId AND tutor_id = u.user_id) as total_classes,
      (SELECT COUNT(*) FROM [Class] WHERE student_id = @studentId AND tutor_id = u.user_id AND status = 'active') as active_classes
    FROM [UserAccount] u
    INNER JOIN [Class] c ON c.tutor_id = u.user_id
    WHERE c.student_id = @studentId AND u.user_id = @tutorId
  `;

  const tutorResult = await dbConnection.query<any>(tutorQuery, { studentId, tutorId });
  
  if (tutorResult.recordset.length === 0) {
    return null;
  }

  const tutor = tutorResult.recordset[0];

  // Get classes for this tutor
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
    WHERE c.student_id = @studentId AND c.tutor_id = @tutorId
    ORDER BY c.status DESC, c.start_date DESC
  `;

  const classesResult = await dbConnection.query<any>(classesQuery, { studentId, tutorId });

  return {
    tutor_id: tutor.tutor_id,
    tutor_name: tutor.tutor_name,
    email: tutor.email,
    phone: tutor.phone,
    avatar_url: tutor.avatar_url,
    bio: tutor.bio,
    total_classes: tutor.total_classes,
    active_classes: tutor.active_classes,
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
 * Search tutors by name for a student
 */
export const searchStudentTutors = async (studentId: string, searchTerm: string): Promise<StudentTutor[]> => {
  const tutorsQuery = `
    SELECT DISTINCT
      u.user_id as tutor_id,
      u.name as tutor_name,
      u.email,
      u.phone,
      u.avatar_url,
      u.bio,
      (SELECT COUNT(*) FROM [Class] WHERE student_id = @studentId AND tutor_id = u.user_id) as total_classes,
      (SELECT COUNT(*) FROM [Class] WHERE student_id = @studentId AND tutor_id = u.user_id AND status = 'active') as active_classes
    FROM [UserAccount] u
    INNER JOIN [Class] c ON c.tutor_id = u.user_id
    WHERE c.student_id = @studentId 
      AND (u.name LIKE @searchTerm OR u.email LIKE @searchTerm)
    ORDER BY u.name ASC
  `;

  const tutorsResult = await dbConnection.query<any>(tutorsQuery, { 
    studentId, 
    searchTerm: `%${searchTerm}%` 
  });
  
  if (tutorsResult.recordset.length === 0) {
    return [];
  }

  // Get all classes for these tutors
  const tutorIds = tutorsResult.recordset.map((t: any) => t.tutor_id);
  
  const classesQuery = `
    SELECT 
      c.class_id,
      c.tutor_id,
      c.status,
      c.grade_level,
      c.start_date,
      c.end_date,
      s.name as subject_name
    FROM [Class] c
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    WHERE c.student_id = @studentId AND c.tutor_id IN (${tutorIds.map((_: string, i: number) => `@tutorId${i}`).join(',')})
    ORDER BY c.status DESC, c.start_date DESC
  `;

  const classParams: Record<string, string> = { studentId };
  tutorIds.forEach((id: string, i: number) => {
    classParams[`tutorId${i}`] = id;
  });

  const classesResult = await dbConnection.query<any>(classesQuery, classParams);

  // Group classes by tutor
  const classesMap: Record<string, any[]> = {};
  for (const cls of classesResult.recordset) {
    if (!classesMap[cls.tutor_id]) {
      classesMap[cls.tutor_id] = [];
    }
    classesMap[cls.tutor_id].push({
      class_id: cls.class_id,
      subject_name: cls.subject_name,
      grade_level: cls.grade_level,
      status: cls.status,
      start_date: cls.start_date,
      end_date: cls.end_date,
    });
  }

  // Combine tutors with their classes
  return tutorsResult.recordset.map((tutor: any) => ({
    tutor_id: tutor.tutor_id,
    tutor_name: tutor.tutor_name,
    email: tutor.email,
    phone: tutor.phone,
    avatar_url: tutor.avatar_url,
    bio: tutor.bio,
    total_classes: tutor.total_classes,
    active_classes: tutor.active_classes,
    classes: classesMap[tutor.tutor_id] || [],
  }));
};
