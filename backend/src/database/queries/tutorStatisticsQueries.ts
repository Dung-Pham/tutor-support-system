/**
 * File: database/queries/tutorStatisticsQueries.ts
 * Purpose: Database queries for Tutor Statistics Dashboard
 * Tables: Class, Schedule, Homework, HomeworkSubmission, Documents, UserAccount
 */

import dbConnection from '../connection';

/**
 * Overview statistics for tutor dashboard
 */
export interface TutorOverview {
  totalStudents: number;
  activeClasses: number;
  totalHomeworks: number;
  totalDocuments: number;
  pendingSubmissions: number;
  completedSessions: number;
}

/**
 * Class with progress info
 */
export interface ClassWithProgress {
  class_id: string;
  student_name: string;
  subject_name: string;
  grade_level: number;
  status: string;
  start_date: Date;
  end_date: Date;
  total_sessions: number;
  completed_homeworks: number;
  total_homeworks: number;
  completion_percentage: number;
}

/**
 * Upcoming homework deadline
 */
export interface UpcomingHomework {
  homework_id: string;
  title: string;
  class_name: string;
  student_name: string;
  due_date: Date;
  status: string;
  days_remaining: number;
}

/**
 * Recent submission
 */
export interface RecentSubmission {
  submission_id: string;
  homework_title: string;
  student_name: string;
  submitted_at: Date;
  is_late: boolean;
  status: string;
  score: number | null;
}

/**
 * Student activity
 */
export interface StudentActivity {
  student_id: string;
  student_name: string;
  email: string;
  active_classes: number;
  total_submissions: number;
  average_score: number | null;
  last_activity: Date | null;
}

/**
 * Get overview statistics for a tutor
 */
export const getTutorOverview = async (tutorId: string): Promise<TutorOverview> => {
  const query = `
    SELECT
      -- Total unique students
      (SELECT COUNT(DISTINCT student_id) FROM [Class] WHERE tutor_id = @tutorId) as totalStudents,
      
      -- Active classes
      (SELECT COUNT(*) FROM [Class] WHERE tutor_id = @tutorId AND status = 'active') as activeClasses,
      
      -- Total homeworks created
      (SELECT COUNT(*) FROM [Homework] WHERE tutor_id = @tutorId AND status = 'ACTIVE') as totalHomeworks,
      
      -- Total documents uploaded
      (SELECT COUNT(*) FROM [Documents] WHERE tutor_id = @tutorId AND status = 'active') as totalDocuments,
      
      -- Pending submissions (need grading)
      (SELECT COUNT(*) 
       FROM [HomeworkSubmission] hs
       INNER JOIN [Homework] h ON hs.homework_id = h.homework_id
       WHERE h.tutor_id = @tutorId AND hs.status = 'SUBMITTED') as pendingSubmissions,
      
      -- Completed sessions (active schedules count as proxy)
      (SELECT COUNT(*) 
       FROM [Schedule] s
       INNER JOIN [Class] c ON s.class_id = c.class_id
       WHERE c.tutor_id = @tutorId AND s.is_active = 1) as completedSessions
  `;

  const result = await dbConnection.query<any>(query, { tutorId });
  const row = result.recordset[0];
  
  return {
    totalStudents: row.totalStudents || 0,
    activeClasses: row.activeClasses || 0,
    totalHomeworks: row.totalHomeworks || 0,
    totalDocuments: row.totalDocuments || 0,
    pendingSubmissions: row.pendingSubmissions || 0,
    completedSessions: row.completedSessions || 0,
  };
};

/**
 * Get classes with progress for tutor
 */
export const getClassesWithProgress = async (tutorId: string): Promise<ClassWithProgress[]> => {
  const query = `
    SELECT 
      c.class_id,
      u.name as student_name,
      s.name as subject_name,
      c.grade_level,
      c.status,
      c.start_date,
      c.end_date,
      (SELECT COUNT(*) FROM [Schedule] WHERE class_id = c.class_id AND is_active = 1) as total_sessions,
      (SELECT COUNT(*) FROM [HomeworkSubmission] hs
       INNER JOIN [HomeworkAssignment] ha ON hs.assignment_id = ha.assignment_id
       INNER JOIN [Homework] h ON ha.homework_id = h.homework_id
       WHERE h.class_id = c.class_id AND hs.status = 'GRADED') as completed_homeworks,
      (SELECT COUNT(*) FROM [HomeworkAssignment] ha
       INNER JOIN [Homework] h ON ha.homework_id = h.homework_id
       WHERE h.class_id = c.class_id) as total_homeworks
    FROM [Class] c
    LEFT JOIN [UserAccount] u ON c.student_id = u.user_id
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    WHERE c.tutor_id = @tutorId
    ORDER BY 
      CASE c.status WHEN 'active' THEN 0 ELSE 1 END,
      c.start_date DESC
  `;

  const result = await dbConnection.query<any>(query, { tutorId });
  
  return result.recordset.map((row: any) => ({
    class_id: row.class_id,
    student_name: row.student_name || 'Chưa có',
    subject_name: row.subject_name || 'Chưa xác định',
    grade_level: row.grade_level,
    status: row.status,
    start_date: row.start_date,
    end_date: row.end_date,
    total_sessions: row.total_sessions || 0,
    completed_homeworks: row.completed_homeworks || 0,
    total_homeworks: row.total_homeworks || 0,
    completion_percentage: row.total_homeworks > 0 
      ? Math.round((row.completed_homeworks / row.total_homeworks) * 100) 
      : 0,
  }));
};

/**
 * Get upcoming homework deadlines
 */
export const getUpcomingHomeworks = async (tutorId: string, limit: number = 5): Promise<UpcomingHomework[]> => {
  const query = `
    SELECT TOP (@limit)
      h.homework_id,
      h.title,
      s.name as class_name,
      u.name as student_name,
      ha.due_date,
      ha.status,
      DATEDIFF(day, GETDATE(), ha.due_date) as days_remaining
    FROM [HomeworkAssignment] ha
    INNER JOIN [Homework] h ON ha.homework_id = h.homework_id
    LEFT JOIN [Class] c ON h.class_id = c.class_id
    LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
    LEFT JOIN [UserAccount] u ON ha.student_id = u.user_id
    WHERE h.tutor_id = @tutorId 
      AND ha.status IN ('ASSIGNED', 'LATE')
      AND ha.due_date >= DATEADD(day, -7, GETDATE())
    ORDER BY ha.due_date ASC
  `;

  const result = await dbConnection.query<any>(query, { tutorId, limit });
  
  return result.recordset.map((row: any) => ({
    homework_id: row.homework_id,
    title: row.title,
    class_name: row.class_name || 'Chung',
    student_name: row.student_name || 'Chưa có',
    due_date: row.due_date,
    status: row.status,
    days_remaining: row.days_remaining,
  }));
};

/**
 * Get recent submissions that need attention
 */
export const getRecentSubmissions = async (tutorId: string, limit: number = 10): Promise<RecentSubmission[]> => {
  const query = `
    SELECT TOP (@limit)
      hs.submission_id,
      h.title as homework_title,
      u.name as student_name,
      hs.submitted_at,
      hs.is_late,
      hs.status,
      hs.score
    FROM [HomeworkSubmission] hs
    INNER JOIN [Homework] h ON hs.homework_id = h.homework_id
    LEFT JOIN [UserAccount] u ON hs.student_id = u.user_id
    WHERE h.tutor_id = @tutorId
    ORDER BY hs.submitted_at DESC
  `;

  const result = await dbConnection.query<any>(query, { tutorId, limit });
  
  return result.recordset.map((row: any) => ({
    submission_id: row.submission_id,
    homework_title: row.homework_title,
    student_name: row.student_name || 'Học viên',
    submitted_at: row.submitted_at,
    is_late: row.is_late || false,
    status: row.status,
    score: row.score,
  }));
};

/**
 * Get student activity summary
 */
export const getStudentActivities = async (tutorId: string): Promise<StudentActivity[]> => {
  const query = `
    SELECT 
      u.user_id as student_id,
      u.name as student_name,
      u.email,
      COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.class_id END) as active_classes,
      (SELECT COUNT(*) 
       FROM [HomeworkSubmission] hs 
       INNER JOIN [HomeworkAssignment] ha ON hs.assignment_id = ha.assignment_id
       WHERE ha.student_id = u.user_id) as total_submissions,
      (SELECT AVG(CAST(hs.score as FLOAT)) 
       FROM [HomeworkSubmission] hs 
       INNER JOIN [HomeworkAssignment] ha ON hs.assignment_id = ha.assignment_id
       WHERE ha.student_id = u.user_id AND hs.score IS NOT NULL) as average_score,
      (SELECT MAX(hs.submitted_at) 
       FROM [HomeworkSubmission] hs 
       INNER JOIN [HomeworkAssignment] ha ON hs.assignment_id = ha.assignment_id
       WHERE ha.student_id = u.user_id) as last_activity
    FROM [UserAccount] u
    INNER JOIN [Class] c ON c.student_id = u.user_id
    WHERE c.tutor_id = @tutorId
    GROUP BY u.user_id, u.name, u.email
    ORDER BY active_classes DESC, u.name ASC
  `;

  const result = await dbConnection.query<any>(query, { tutorId });
  
  return result.recordset.map((row: any) => ({
    student_id: row.student_id,
    student_name: row.student_name,
    email: row.email,
    active_classes: row.active_classes || 0,
    total_submissions: row.total_submissions || 0,
    average_score: row.average_score ? Math.round(row.average_score * 10) / 10 : null,
    last_activity: row.last_activity,
  }));
};

/**
 * Get monthly statistics
 */
export const getMonthlyStats = async (tutorId: string, year: number = new Date().getFullYear()): Promise<any[]> => {
  const query = `
    SELECT 
      MONTH(ha.assigned_at) as month,
      COUNT(DISTINCT ha.assignment_id) as assignments_given,
      COUNT(DISTINCT hs.submission_id) as submissions_received,
      COUNT(DISTINCT CASE WHEN hs.status = 'GRADED' THEN hs.submission_id END) as graded,
      AVG(CAST(hs.score as FLOAT)) as average_score
    FROM [HomeworkAssignment] ha
    INNER JOIN [Homework] h ON ha.homework_id = h.homework_id
    LEFT JOIN [HomeworkSubmission] hs ON ha.assignment_id = hs.assignment_id
    WHERE h.tutor_id = @tutorId 
      AND YEAR(ha.assigned_at) = @year
    GROUP BY MONTH(ha.assigned_at)
    ORDER BY month ASC
  `;

  const result = await dbConnection.query<any>(query, { tutorId, year });
  return result.recordset;
};
