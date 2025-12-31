/**
 * File: database/queries/statisticsQueries.ts
 * Purpose: Database queries for Progress Statistics and Reporting
 */

import dbConnection from '../connection';
import { ProgressStatistics } from '../../types';

/**
 * Get or create progress statistics for a student
 * @param studentId Student ID
 * @param month Month (1-12)
 * @param year Year
 * @returns Promise<ProgressStatistics>
 */
export const getOrCreateStatistics = async (
  studentId: number,
  month: number,
  year: number
): Promise<ProgressStatistics> => {
  // Try to get existing statistics
  const selectQuery = `
    SELECT *
    FROM ProgressStatistics
    WHERE studentId = @studentId AND month = @month AND year = @year
  `;

  const existingResult = await dbConnection.query<ProgressStatistics>(selectQuery, {
    studentId,
    month,
    year,
  });

  if (existingResult.recordset.length > 0) {
    return existingResult.recordset[0];
  }

  // Create new statistics
  const insertQuery = `
    INSERT INTO ProgressStatistics (
      studentId, month, year, totalClasses, completedClasses,
      averageUnderstanding, averageParticipation, averageHomework,
      averageProgress, overallAverage, totalHomework, completedHomework,
      attendanceRate, createdAt, updatedAt
    )
    OUTPUT INSERTED.*
    VALUES (
      @studentId, @month, @year, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<ProgressStatistics>(insertQuery, {
    studentId,
    month,
    year,
  });

  return result.recordset[0];
};

/**
 * Update progress statistics for a student
 * @param studentId Student ID
 * @param month Month (1-12)
 * @param year Year
 * @returns Promise<ProgressStatistics>
 */
export const updateStatistics = async (
  studentId: number,
  month: number,
  year: number
): Promise<ProgressStatistics> => {
  // Calculate statistics from evaluations
  const statsQuery = `
    SELECT 
      COUNT(DISTINCT s.id) as totalClasses,
      COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completedClasses,
      AVG(CAST(pe.understandingScore as FLOAT)) as avgUnderstanding,
      AVG(CAST(pe.participationScore as FLOAT)) as avgParticipation,
      AVG(CAST(pe.homeworkScore as FLOAT)) as avgHomework,
      AVG(CAST(pe.progressScore as FLOAT)) as avgProgress,
      AVG(CAST(pe.overallScore as FLOAT)) as avgOverall
    FROM Schedule s
    INNER JOIN TutorRequest tr ON s.tutorRequestId = tr.id
    LEFT JOIN ProgressEvaluation pe ON s.id = pe.scheduleId
    WHERE tr.studentId = @studentId
      AND MONTH(s.startTime) = @month
      AND YEAR(s.startTime) = @year
  `;

  const statsResult = await dbConnection.query<{
    totalClasses: number;
    completedClasses: number;
    avgUnderstanding: number;
    avgParticipation: number;
    avgHomework: number;
    avgProgress: number;
    avgOverall: number;
  }>(statsQuery, { studentId, month, year });

  const stats = statsResult.recordset[0];

  // Calculate homework statistics
  const homeworkQuery = `
    SELECT 
      COUNT(*) as totalHomework,
      COUNT(CASE WHEN hs.status = 'graded' THEN 1 END) as completedHomework
    FROM Homework h
    INNER JOIN Schedule s ON h.scheduleId = s.id
    LEFT JOIN HomeworkSubmission hs ON h.id = hs.homeworkId
    WHERE h.studentId = @studentId
      AND MONTH(s.startTime) = @month
      AND YEAR(s.startTime) = @year
  `;

  const homeworkResult = await dbConnection.query<{
    totalHomework: number;
    completedHomework: number;
  }>(homeworkQuery, { studentId, month, year });

  const homework = homeworkResult.recordset[0];

  // Calculate attendance rate
  const attendanceQuery = `
    SELECT 
      COUNT(*) as totalAttendance,
      COUNT(CASE WHEN ar.status = 'confirmed' THEN 1 END) as confirmedAttendance
    FROM AttendanceRecord ar
    INNER JOIN Schedule s ON ar.scheduleId = s.id
    INNER JOIN TutorRequest tr ON s.tutorRequestId = tr.id
    WHERE tr.studentId = @studentId
      AND MONTH(s.startTime) = @month
      AND YEAR(s.startTime) = @year
  `;

  const attendanceResult = await dbConnection.query<{
    totalAttendance: number;
    confirmedAttendance: number;
  }>(attendanceQuery, { studentId, month, year });

  const attendance = attendanceResult.recordset[0];
  const attendanceRate =
    attendance.totalAttendance > 0
      ? (attendance.confirmedAttendance / attendance.totalAttendance) * 100
      : 0;

  // Update or insert statistics
  const updateQuery = `
    UPDATE ProgressStatistics
    SET 
      totalClasses = @totalClasses,
      completedClasses = @completedClasses,
      averageUnderstanding = @avgUnderstanding,
      averageParticipation = @avgParticipation,
      averageHomework = @avgHomework,
      averageProgress = @avgProgress,
      overallAverage = @avgOverall,
      totalHomework = @totalHomework,
      completedHomework = @completedHomework,
      attendanceRate = @attendanceRate,
      updatedAt = GETDATE()
    OUTPUT INSERTED.*
    WHERE studentId = @studentId AND month = @month AND year = @year
  `;

  const result = await dbConnection.query<ProgressStatistics>(updateQuery, {
    studentId,
    month,
    year,
    totalClasses: stats.totalClasses,
    completedClasses: stats.completedClasses,
    avgUnderstanding: Math.round((stats.avgUnderstanding || 0) * 100) / 100,
    avgParticipation: Math.round((stats.avgParticipation || 0) * 100) / 100,
    avgHomework: Math.round((stats.avgHomework || 0) * 100) / 100,
    avgProgress: Math.round((stats.avgProgress || 0) * 100) / 100,
    avgOverall: Math.round((stats.avgOverall || 0) * 100) / 100,
    totalHomework: homework.totalHomework,
    completedHomework: homework.completedHomework,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
  });

  return result.recordset[0];
};

/**
 * Get statistics for a student
 * @param studentId Student ID
 * @param month Optional month filter
 * @param year Optional year filter
 * @returns Promise<ProgressStatistics[]>
 */
export const getStatistics = async (
  studentId: number,
  month?: number,
  year?: number
): Promise<ProgressStatistics[]> => {
  let whereConditions: string[] = ['studentId = @studentId'];
  const params: Record<string, any> = { studentId };

  if (month) {
    whereConditions.push('month = @month');
    params.month = month;
  }

  if (year) {
    whereConditions.push('year = @year');
    params.year = year;
  }

  const whereClause = whereConditions.join(' AND ');

  const query = `
    SELECT ps.*,
           u.name as studentName
    FROM ProgressStatistics ps
    LEFT JOIN [User] u ON ps.studentId = u.id
    WHERE ${whereClause}
    ORDER BY ps.year DESC, ps.month DESC
  `;

  const result = await dbConnection.query<ProgressStatistics>(query, params);
  return result.recordset;
};

/**
 * Get statistics summary for multiple months
 * @param studentId Student ID
 * @param startMonth Start month
 * @param startYear Start year
 * @param endMonth End month
 * @param endYear End year
 * @returns Promise<ProgressStatistics[]>
 */
export const getStatisticsRange = async (
  studentId: number,
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number
): Promise<ProgressStatistics[]> => {
  const query = `
    SELECT *
    FROM ProgressStatistics
    WHERE studentId = @studentId
      AND (
        (year = @startYear AND month >= @startMonth)
        OR (year > @startYear AND year < @endYear)
        OR (year = @endYear AND month <= @endMonth)
      )
    ORDER BY year ASC, month ASC
  `;

  const result = await dbConnection.query<ProgressStatistics>(query, {
    studentId,
    startMonth,
    startYear,
    endMonth,
    endYear,
  });

  return result.recordset;
};

/**
 * Get overall statistics for a student (all time)
 * @param studentId Student ID
 * @returns Promise<Object>
 */
export const getOverallStatistics = async (
  studentId: number
): Promise<{
  totalClasses: number;
  completedClasses: number;
  averageScores: {
    understanding: number;
    participation: number;
    homework: number;
    progress: number;
    overall: number;
  };
  totalHomework: number;
  completedHomework: number;
  attendanceRate: number;
  monthsActive: number;
}> => {
  const query = `
    SELECT 
      SUM(totalClasses) as totalClasses,
      SUM(completedClasses) as completedClasses,
      AVG(averageUnderstanding) as avgUnderstanding,
      AVG(averageParticipation) as avgParticipation,
      AVG(averageHomework) as avgHomework,
      AVG(averageProgress) as avgProgress,
      AVG(overallAverage) as avgOverall,
      SUM(totalHomework) as totalHomework,
      SUM(completedHomework) as completedHomework,
      AVG(attendanceRate) as avgAttendanceRate,
      COUNT(*) as monthsActive
    FROM ProgressStatistics
    WHERE studentId = @studentId
  `;

  const result = await dbConnection.query<{
    totalClasses: number;
    completedClasses: number;
    avgUnderstanding: number;
    avgParticipation: number;
    avgHomework: number;
    avgProgress: number;
    avgOverall: number;
    totalHomework: number;
    completedHomework: number;
    avgAttendanceRate: number;
    monthsActive: number;
  }>(query, { studentId });

  const stats = result.recordset[0];

  return {
    totalClasses: stats.totalClasses || 0,
    completedClasses: stats.completedClasses || 0,
    averageScores: {
      understanding: Math.round((stats.avgUnderstanding || 0) * 100) / 100,
      participation: Math.round((stats.avgParticipation || 0) * 100) / 100,
      homework: Math.round((stats.avgHomework || 0) * 100) / 100,
      progress: Math.round((stats.avgProgress || 0) * 100) / 100,
      overall: Math.round((stats.avgOverall || 0) * 100) / 100,
    },
    totalHomework: stats.totalHomework || 0,
    completedHomework: stats.completedHomework || 0,
    attendanceRate: Math.round((stats.avgAttendanceRate || 0) * 100) / 100,
    monthsActive: stats.monthsActive || 0,
  };
};

/**
 * Compare student statistics across different periods
 * @param studentId Student ID
 * @param periods Array of {month, year} objects
 * @returns Promise<Array>
 */
export const compareStatistics = async (
  studentId: number,
  periods: Array<{ month: number; year: number }>
): Promise<
  Array<{
    period: string;
    statistics: ProgressStatistics | null;
  }>
> => {
  const results = await Promise.all(
    periods.map(async (period) => {
      const stats = await getStatistics(studentId, period.month, period.year);
      return {
        period: `${period.year}-${String(period.month).padStart(2, '0')}`,
        statistics: stats.length > 0 ? stats[0] : null,
      };
    })
  );

  return results;
};

/**
 * Delete statistics
 * @param statisticsId Statistics ID
 * @returns Promise<boolean>
 */
export const deleteStatistics = async (statisticsId: number): Promise<boolean> => {
  const query = `
    DELETE FROM ProgressStatistics
    WHERE id = @statisticsId
  `;

  const result = await dbConnection.query(query, { statisticsId });
  return result.rowsAffected[0] > 0;
};
