/**
 * File: database/queries/advancedStatisticsQueries.ts
 * Purpose: Advanced statistics queries for Tutor Dashboard with filters
 * Logic:
 *   - Số buổi dạy: Tính từ Schedule (day_of_week) × số tuần trong tháng
 *   - Doanh thu: Số buổi CONFIRMED trong AttendanceRecord × Class.hourly_price × duration
 *   - Tỉ lệ hoàn thành: Buổi CONFIRMED / Tổng số buổi lý thuyết
 */

import dbConnection from '../connection';
import {
  StatisticsFilters,
  StatisticsOverview,
  SessionRevenueDataPoint,
  TimeDistributionItem,
  LearningEffectivenessItem,
  TopStudent,
  StudentNeedingAttention,
  ClassOption,
} from '../../types/statistics.types';

/**
 * Helper: Get start and end date based on filter
 */
function getDateRange(filters: StatisticsFilters): { startDate: Date; endDate: Date } {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (filters.timeFilter) {
    case 'this_week':
      // Get Monday of current week
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday is 0
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6); // Sunday
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'last_3_months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'custom':
      if (filters.fromDate && filters.toDate) {
        startDate = new Date(filters.fromDate);
        endDate = new Date(filters.toDate);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
      break;
    default:
      // Default to this_week
      const dow = now.getDay();
      const diff = dow === 0 ? -6 : 1 - dow;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);
  }

  return { startDate, endDate };
}

/**
 * Helper: Count occurrences of a day_of_week between two dates
 * Schedule.day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 * JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 * They match exactly!
 */
function countDayOccurrences(startDate: Date, endDate: Date, dayOfWeek: number): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (current.getDay() === dayOfWeek) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Helper: Build date range WHERE clause for session_date
 */
function buildDateRangeCondition(
  filters: StatisticsFilters,
  dateColumn: string
): { condition: string; params: Record<string, any> } {
  const params: Record<string, any> = {};
  let condition = '';

  switch (filters.timeFilter) {
    case 'this_month':
      condition = `${dateColumn} >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) AND ${dateColumn} < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)`;
      break;
    case 'last_month':
      condition = `${dateColumn} >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 1, 0) AND ${dateColumn} < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)`;
      break;
    case 'last_3_months':
      condition = `${dateColumn} >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 3, 0) AND ${dateColumn} < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)`;
      break;
    case 'custom':
      if (filters.fromDate && filters.toDate) {
        condition = `${dateColumn} >= @fromDate AND ${dateColumn} <= @toDate`;
        params.fromDate = filters.fromDate;
        params.toDate = filters.toDate;
      } else {
        condition = `${dateColumn} >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)`;
      }
      break;
    default:
      condition = `${dateColumn} >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)`;
  }

  return { condition, params };
}

/**
 * Helper: Get previous period date range for comparison
 */
function getPrevPeriodCondition(
  filters: StatisticsFilters,
  dateColumn: string
): string {
  switch (filters.timeFilter) {
    case 'this_month':
      return `${dateColumn} >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 1, 0) AND ${dateColumn} < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)`;
    case 'last_month':
      return `${dateColumn} >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 2, 0) AND ${dateColumn} < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 1, 0)`;
    case 'last_3_months':
      return `${dateColumn} >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 6, 0) AND ${dateColumn} < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 3, 0)`;
    default:
      return `${dateColumn} >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 1, 0) AND ${dateColumn} < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)`;
  }
}

/**
 * Get KPI Overview statistics
 * Logic:
 *   - totalSessions: Tính từ Schedule (đếm số ngày trong tháng khớp với day_of_week của mỗi lớp)
 *   - completedSessions: Số buổi có overall_status = 'CONFIRMED' trong AttendanceRecord
 *   - totalRevenue: completedSessions × hourly_price × (duration_minutes / 60)
 *   - totalTeachingHours: totalSessions × duration_minutes / 60
 */
export async function getStatisticsOverview(
  tutorId: string,
  filters: StatisticsFilters
): Promise<StatisticsOverview> {
  const pool = await dbConnection.getPool();
  const { startDate, endDate } = getDateRange(filters);
  const { condition: dateCondition, params } = buildDateRangeCondition(filters, 'ar.session_date');
  
  const classCondition = filters.classId && filters.classId !== 'all' 
    ? 'AND c.class_id = @classId' 
    : '';

  // 1. Get all schedules for tutor's active classes
  const schedulesQuery = `
    SELECT 
      c.class_id,
      c.hourly_price,
      s.day_of_week,
      s.duration_minutes
    FROM Class c
    INNER JOIN Schedule s ON s.class_id = c.class_id
    WHERE c.tutor_id = @tutorId
      AND c.status = 'active'
      AND s.is_active = 1
      ${classCondition}
  `;

  // 2. Get attendance stats (confirmed sessions)
  const attendanceQuery = `
    SELECT 
      COUNT(DISTINCT CASE WHEN ar.overall_status = 'CONFIRMED' THEN ar.attendance_id END) as completedSessions,
      COUNT(DISTINCT CASE WHEN ar.overall_status = 'CANCELLED' THEN ar.attendance_id END) as canceledSessions,
      ISNULL(SUM(
        CASE WHEN ar.overall_status = 'CONFIRMED' 
        THEN CAST(c.hourly_price AS FLOAT) * s.duration_minutes / 60.0
        ELSE 0 END
      ), 0) as confirmedRevenue,
      ISNULL(SUM(
        CASE WHEN ar.overall_status = 'CONFIRMED' 
        THEN s.duration_minutes / 60.0
        ELSE 0 END
      ), 0) as confirmedHours
    FROM AttendanceRecord ar
    INNER JOIN Class c ON ar.class_id = c.class_id
    INNER JOIN Schedule s ON ar.schedule_id = s.schedule_id
    WHERE c.tutor_id = @tutorId
      AND ${dateCondition}
      ${classCondition}
  `;

  const request = pool.request();
  request.input('tutorId', tutorId);
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });
  if (filters.classId && filters.classId !== 'all') {
    request.input('classId', filters.classId);
  }

  const [schedulesResult, attendanceResult] = await Promise.all([
    request.query(schedulesQuery),
    pool.request()
      .input('tutorId', tutorId)
      .input('classId', filters.classId || null)
      .input('fromDate', params.fromDate || null)
      .input('toDate', params.toDate || null)
      .query(attendanceQuery)
  ]);

  // Calculate total sessions from schedules
  let totalSessions = 0;
  let totalTeachingHours = 0;
  let totalExpectedRevenue = 0;
  
  const schedules = schedulesResult.recordset;
  for (const sch of schedules) {
    // Count how many times this day_of_week occurs in the date range
    const occurrences = countDayOccurrences(startDate, endDate, sch.day_of_week);
    totalSessions += occurrences;
    totalTeachingHours += occurrences * (sch.duration_minutes / 60);
    totalExpectedRevenue += occurrences * (parseFloat(sch.hourly_price) || 0) * (sch.duration_minutes / 60);
  }

  const attendance = attendanceResult.recordset[0];
  const completedSessions = attendance?.completedSessions || 0;
  const canceledSessions = attendance?.canceledSessions || 0;
  const confirmedRevenue = Math.round(attendance?.confirmedRevenue || 0);

  // Get previous period stats for comparison
  const prevRange = getPrevDateRange(filters);
  let prevTotalSessions = 0;
  let prevRevenue = 0;

  if (prevRange) {
    for (const sch of schedules) {
      const occurrences = countDayOccurrences(prevRange.startDate, prevRange.endDate, sch.day_of_week);
      prevTotalSessions += occurrences;
      prevRevenue += occurrences * (parseFloat(sch.hourly_price) || 0) * (sch.duration_minutes / 60);
    }
  }

  return {
    totalSessions,
    totalSessionsChangePercent: prevTotalSessions > 0 
      ? Math.round(((totalSessions - prevTotalSessions) / prevTotalSessions) * 100) 
      : (totalSessions > 0 ? 100 : 0),
    totalTeachingHours: Math.round(totalTeachingHours * 10) / 10,
    avgHoursPerSession: totalSessions > 0 
      ? Math.round((totalTeachingHours / totalSessions) * 10) / 10 
      : 0,
    totalRevenue: confirmedRevenue, // Use actual confirmed revenue
    revenueChangeVsPrevPeriod: confirmedRevenue - Math.round(prevRevenue),
    sessionCompletionRate: totalSessions > 0 
      ? Math.round((completedSessions / totalSessions) * 100) / 100 
      : 0,
    completedSessions,
    canceledSessions,
    avgSatisfactionScore: undefined,
    totalFeedbackCount: undefined,
  };
}

/**
 * Helper: Get previous period date range
 */
function getPrevDateRange(filters: StatisticsFilters): { startDate: Date; endDate: Date } | null {
  const now = new Date();
  
  switch (filters.timeFilter) {
    case 'this_month':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), 0)
      };
    case 'last_month':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() - 1, 0)
      };
    case 'last_3_months':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() - 2, 0)
      };
    default:
      return null;
  }
}

/**
 * Get Sessions & Revenue Over Time (for line/bar chart)
 * Calculates sessions based on Schedule (day_of_week), revenue from CONFIRMED AttendanceRecords
 */
export async function getSessionsRevenueOverTime(
  tutorId: string,
  filters: StatisticsFilters
): Promise<{ data: SessionRevenueDataPoint[]; periodType: 'daily' | 'weekly' }> {
  const pool = await dbConnection.getPool();
  
  const classCondition = filters.classId && filters.classId !== 'all' 
    ? 'AND c.class_id = @classId' 
    : '';

  // Determine date range
  const { startDate, endDate } = getDateRange(filters);
  
  const periodType: 'daily' | 'weekly' = filters.timeFilter === 'last_3_months' ? 'weekly' : 'daily';

  // 1. Get all schedules for the tutor
  const schedulesQuery = `
    SELECT 
      c.class_id,
      c.hourly_price,
      s.day_of_week,
      s.duration_minutes
    FROM Class c
    INNER JOIN Schedule s ON s.class_id = c.class_id
    WHERE c.tutor_id = @tutorId
      AND c.status = 'active'
      AND s.is_active = 1
      ${classCondition}
  `;

  // 2. Get confirmed revenue by date
  const revenueQuery = `
    SELECT 
      CAST(ar.session_date AS DATE) as session_date,
      ISNULL(SUM(
        CASE WHEN ar.overall_status = 'CONFIRMED' 
        THEN CAST(c.hourly_price AS FLOAT) * s.duration_minutes / 60.0
        ELSE 0 END
      ), 0) as revenue
    FROM AttendanceRecord ar
    INNER JOIN Class c ON ar.class_id = c.class_id
    INNER JOIN Schedule s ON ar.schedule_id = s.schedule_id
    WHERE c.tutor_id = @tutorId
      AND ar.session_date >= @startDate AND ar.session_date <= @endDate
      ${classCondition}
    GROUP BY CAST(ar.session_date AS DATE)
  `;

  const request = pool.request();
  request.input('tutorId', tutorId);
  if (filters.classId && filters.classId !== 'all') {
    request.input('classId', filters.classId);
  }

  const [schedulesResult, revenueResult] = await Promise.all([
    request.query(schedulesQuery),
    pool.request()
      .input('tutorId', tutorId)
      .input('classId', filters.classId || null)
      .input('startDate', startDate)
      .input('endDate', endDate)
      .query(revenueQuery)
  ]);

  const schedules = schedulesResult.recordset;
  
  // Create revenue lookup by date
  const revenueByDate: Record<string, number> = {};
  for (const row of revenueResult.recordset) {
    const dateKey = row.session_date.toISOString().split('T')[0];
    revenueByDate[dateKey] = row.revenue;
  }

  // 3. Generate all dates and calculate sessions for each day
  const dataByDate: Record<string, { sessions: number; hours: number; revenue: number }> = {};
  
  const currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);
  
  while (currentDate <= endDateObj) {
    // Use LOCAL timezone for both dateKey and dayOfWeek to be consistent
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    // Schedule.day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat - They match!
    const dayOfWeek = currentDate.getDay();
    
    let sessionsToday = 0;
    let hoursToday = 0;
    
    for (const sch of schedules) {
      if (sch.day_of_week === dayOfWeek) {
        sessionsToday++;
        hoursToday += (sch.duration_minutes || 90) / 60;
      }
    }
    
    // Always add all days, even if sessions = 0
    dataByDate[dateKey] = {
      sessions: sessionsToday,
      hours: hoursToday,
      revenue: revenueByDate[dateKey] || 0
    };
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 4. Convert to array and format
  const data: SessionRevenueDataPoint[] = Object.entries(dataByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, values]) => {
      const date = new Date(dateKey);
      return {
        date: dateKey,
        label: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
        sessions: values.sessions,
        hours: Math.round(values.hours * 10) / 10,
        revenue: Math.round(values.revenue),
      };
    });

  return { data, periodType };
}

/**
 * Get Time Distribution by Class/Subject (for pie chart)
 */
export async function getTimeDistribution(
  tutorId: string,
  filters: StatisticsFilters
): Promise<{ data: TimeDistributionItem[]; totalHours: number; totalRevenue: number; totalSessions: number }> {
  const pool = await dbConnection.getPool();
  const { condition: dateCondition, params } = buildDateRangeCondition(filters, 'ar.session_date');

  const query = `
    SELECT 
      c.class_id as classId,
      sub.name as subjectName,
      u.name as studentName,
      sub.name + ' - ' + u.name as className,
      COUNT(DISTINCT ar.attendance_id) as sessions,
      ISNULL(SUM(
        CASE WHEN ar.overall_status = 'CONFIRMED' 
        THEN s.duration_minutes / 60.0
        ELSE 0 END
      ), 0) as hours,
      ISNULL(SUM(
        CASE WHEN ar.overall_status = 'CONFIRMED' 
        THEN CAST(c.hourly_price AS FLOAT) * s.duration_minutes / 60.0
        ELSE 0 END
      ), 0) as revenue
    FROM AttendanceRecord ar
    INNER JOIN Class c ON ar.class_id = c.class_id
    INNER JOIN Schedule s ON ar.schedule_id = s.schedule_id
    INNER JOIN Subjects sub ON c.subject_id = sub.subject_id
    INNER JOIN UserAccount u ON c.student_id = u.user_id
    WHERE c.tutor_id = @tutorId
      AND ${dateCondition}
    GROUP BY c.class_id, sub.name, u.name
    ORDER BY hours DESC
  `;

  const request = pool.request();
  request.input('tutorId', tutorId);
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });

  const result = await request.query(query);

  const totalHours = result.recordset.reduce((sum, row) => sum + (row.hours || 0), 0);
  const totalRevenue = result.recordset.reduce((sum, row) => sum + (row.revenue || 0), 0);
  const totalSessions = result.recordset.reduce((sum, row) => sum + (row.sessions || 0), 0);

  return {
    data: result.recordset.map(row => ({
      classId: row.classId,
      className: row.className,
      subjectName: row.subjectName,
      studentName: row.studentName,
      sessions: row.sessions,
      hours: Math.round(row.hours * 10) / 10,
      revenue: Math.round(row.revenue),
      percentage: totalHours > 0 ? Math.round((row.hours / totalHours) * 100) : 0,
    })),
    totalHours: Math.round(totalHours * 10) / 10,
    totalRevenue: Math.round(totalRevenue),
    totalSessions,
  };
}

/**
 * Get Learning Effectiveness by Class (for stacked bar chart)
 * Based on HomeworkSubmission status
 */
export async function getLearningEffectiveness(
  tutorId: string,
  filters: StatisticsFilters
): Promise<{ data: LearningEffectivenessItem[]; overallStats: any }> {
  const pool = await dbConnection.getPool();
  const { condition: dateCondition, params } = buildDateRangeCondition(filters, 'h.due_date');
  
  const classCondition = filters.classId && filters.classId !== 'all' 
    ? 'AND c.class_id = @classId' 
    : '';

  const query = `
    SELECT 
      c.class_id as classId,
      sub.name + ' - ' + u.name as className,
      u.name as studentName,
      COUNT(DISTINCT ha.assignment_id) as totalAssignments,
      COUNT(DISTINCT CASE 
        WHEN hs.submitted_at IS NOT NULL AND hs.submitted_at <= h.due_date THEN ha.assignment_id 
      END) as onTimeCount,
      COUNT(DISTINCT CASE 
        WHEN hs.submitted_at IS NOT NULL AND hs.submitted_at > h.due_date THEN ha.assignment_id 
      END) as lateCount,
      COUNT(DISTINCT CASE 
        WHEN hs.submitted_at IS NULL AND h.due_date < GETDATE() THEN ha.assignment_id 
      END) as missingCount,
      AVG(CAST(hs.score AS FLOAT)) as averageScore
    FROM Class c
    INNER JOIN Subjects sub ON c.subject_id = sub.subject_id
    INNER JOIN UserAccount u ON c.student_id = u.user_id
    LEFT JOIN Homework h ON h.class_id = c.class_id
    LEFT JOIN HomeworkAssignment ha ON ha.homework_id = h.homework_id
    LEFT JOIN HomeworkSubmission hs ON hs.assignment_id = ha.assignment_id
    WHERE c.tutor_id = @tutorId
      AND c.status = 'active'
      ${classCondition}
      AND (h.homework_id IS NULL OR ${dateCondition})
    GROUP BY c.class_id, sub.name, u.name
    HAVING COUNT(DISTINCT ha.assignment_id) > 0
    ORDER BY className
  `;

  const request = pool.request();
  request.input('tutorId', tutorId);
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });
  if (filters.classId && filters.classId !== 'all') {
    request.input('classId', filters.classId);
  }

  const result = await request.query(query);

  // Calculate overall stats
  let totalAssignments = 0;
  let totalOnTime = 0;
  let totalLate = 0;
  let totalMissing = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  const data: LearningEffectivenessItem[] = result.recordset.map(row => {
    const total = row.totalAssignments || 0;
    const onTime = row.onTimeCount || 0;
    const late = row.lateCount || 0;
    const missing = row.missingCount || 0;

    totalAssignments += total;
    totalOnTime += onTime;
    totalLate += late;
    totalMissing += missing;
    if (row.averageScore !== null) {
      scoreSum += row.averageScore;
      scoreCount++;
    }

    return {
      classId: row.classId,
      className: row.className,
      studentName: row.studentName,
      onTimePercent: total > 0 ? Math.round((onTime / total) * 100) / 100 : 0,
      latePercent: total > 0 ? Math.round((late / total) * 100) / 100 : 0,
      missingPercent: total > 0 ? Math.round((missing / total) * 100) / 100 : 0,
      totalAssignments: total,
      onTimeCount: onTime,
      lateCount: late,
      missingCount: missing,
      averageScore: row.averageScore !== null ? Math.round(row.averageScore * 10) / 10 : null,
    };
  });

  return {
    data,
    overallStats: {
      overallOnTimePercent: totalAssignments > 0 ? Math.round((totalOnTime / totalAssignments) * 100) / 100 : 0,
      overallLatePercent: totalAssignments > 0 ? Math.round((totalLate / totalAssignments) * 100) / 100 : 0,
      overallMissingPercent: totalAssignments > 0 ? Math.round((totalMissing / totalAssignments) * 100) / 100 : 0,
      overallAverageScore: scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : null,
    },
  };
}

/**
 * Get Top Students (based on score, on-time rate, attendance)
 */
export async function getTopStudents(
  tutorId: string,
  filters: StatisticsFilters
): Promise<TopStudent[]> {
  const pool = await dbConnection.getPool();
  
  const classCondition = filters.classId && filters.classId !== 'all' 
    ? 'AND c.class_id = @classId' 
    : '';

  const query = `
    WITH StudentStats AS (
      SELECT 
        u.user_id as studentId,
        u.name as name,
        u.email,
        AVG(CAST(hs.score AS FLOAT)) as averageScore,
        CAST(COUNT(CASE WHEN hs.submitted_at <= h.due_date THEN 1 END) AS FLOAT) / 
          NULLIF(COUNT(hs.submission_id), 0) as onTimeRate,
        (SELECT COUNT(DISTINCT ar2.attendance_id) FROM AttendanceRecord ar2 
         INNER JOIN Class c2 ON ar2.class_id = c2.class_id 
         WHERE c2.student_id = u.user_id AND c2.tutor_id = @tutorId 
         AND ar2.overall_status = 'CONFIRMED') as attendedSessions,
        (SELECT COUNT(DISTINCT ar3.attendance_id) FROM AttendanceRecord ar3 
         INNER JOIN Class c3 ON ar3.class_id = c3.class_id 
         WHERE c3.student_id = u.user_id AND c3.tutor_id = @tutorId) as totalSessions
      FROM UserAccount u
      INNER JOIN Class c ON c.student_id = u.user_id
      LEFT JOIN Homework h ON h.class_id = c.class_id
      LEFT JOIN HomeworkAssignment ha ON ha.homework_id = h.homework_id AND ha.student_id = u.user_id
      LEFT JOIN HomeworkSubmission hs ON hs.assignment_id = ha.assignment_id
      WHERE c.tutor_id = @tutorId
        AND c.status = 'active'
        ${classCondition}
      GROUP BY u.user_id, u.name, u.email
      HAVING AVG(CAST(hs.score AS FLOAT)) IS NOT NULL
    )
    SELECT TOP 3
      studentId,
      name,
      email,
      ISNULL(averageScore, 0) as averageScore,
      ISNULL(onTimeRate, 0) as onTimeSubmissionRate,
      attendedSessions,
      totalSessions
    FROM StudentStats
    ORDER BY 
      averageScore DESC,
      onTimeRate DESC,
      attendedSessions DESC
  `;

  const request = pool.request();
  request.input('tutorId', tutorId);
  if (filters.classId && filters.classId !== 'all') {
    request.input('classId', filters.classId);
  }

  const result = await request.query(query);

  return result.recordset.map((row, index) => ({
    studentId: row.studentId,
    name: row.name,
    email: row.email,
    averageScore: Math.round(row.averageScore * 10) / 10,
    onTimeSubmissionRate: Math.round(row.onTimeSubmissionRate * 100) / 100,
    attendedSessions: row.attendedSessions,
    totalSessions: row.totalSessions,
    rank: index + 1,
  }));
}

/**
 * Get Students Needing Attention (low score, high absence, missing assignments)
 */
export async function getStudentsNeedingAttention(
  tutorId: string,
  filters: StatisticsFilters,
  thresholds = { lowScore: 6.5, highAbsence: 0.2, missingAssignments: 3 }
): Promise<StudentNeedingAttention[]> {
  const pool = await dbConnection.getPool();
  
  const classCondition = filters.classId && filters.classId !== 'all' 
    ? 'AND c.class_id = @classId' 
    : '';

  const query = `
    WITH StudentStats AS (
      SELECT 
        u.user_id as studentId,
        u.name as name,
        u.email,
        sub.name + ' - Lớp ' + CAST(c.grade_level AS VARCHAR) as className,
        AVG(CAST(hs.score AS FLOAT)) as averageScore,
        (SELECT COUNT(DISTINCT ar2.attendance_id) FROM AttendanceRecord ar2 
         INNER JOIN Class c2 ON ar2.class_id = c2.class_id 
         WHERE c2.student_id = u.user_id AND c2.tutor_id = @tutorId 
         AND ar2.overall_status IN ('CANCELLED', 'ABSENT')) as absentSessions,
        (SELECT COUNT(DISTINCT ar3.attendance_id) FROM AttendanceRecord ar3 
         INNER JOIN Class c3 ON ar3.class_id = c3.class_id 
         WHERE c3.student_id = u.user_id AND c3.tutor_id = @tutorId) as totalSessions,
        COUNT(DISTINCT CASE 
          WHEN hs.submitted_at IS NULL AND h.due_date < GETDATE() THEN ha.assignment_id 
        END) as missingAssignments
      FROM UserAccount u
      INNER JOIN Class c ON c.student_id = u.user_id
      INNER JOIN Subjects sub ON c.subject_id = sub.subject_id
      LEFT JOIN Homework h ON h.class_id = c.class_id
      LEFT JOIN HomeworkAssignment ha ON ha.homework_id = h.homework_id AND ha.student_id = u.user_id
      LEFT JOIN HomeworkSubmission hs ON hs.assignment_id = ha.assignment_id
      WHERE c.tutor_id = @tutorId
        AND c.status = 'active'
        ${classCondition}
      GROUP BY u.user_id, u.name, u.email, sub.name, c.grade_level
    )
    SELECT *,
      CAST(absentSessions AS FLOAT) / NULLIF(totalSessions, 0) as absentRate
    FROM StudentStats
    WHERE 
      (averageScore IS NOT NULL AND averageScore < @lowScoreThreshold)
      OR (CAST(absentSessions AS FLOAT) / NULLIF(totalSessions, 0)) > @highAbsenceThreshold
      OR missingAssignments > @missingAssignmentsThreshold
    ORDER BY 
      CASE WHEN averageScore IS NOT NULL AND averageScore < @lowScoreThreshold THEN 1 ELSE 0 END +
      CASE WHEN (CAST(absentSessions AS FLOAT) / NULLIF(totalSessions, 0)) > @highAbsenceThreshold THEN 1 ELSE 0 END +
      CASE WHEN missingAssignments > @missingAssignmentsThreshold THEN 1 ELSE 0 END DESC,
      averageScore ASC
  `;

  const request = pool.request();
  request.input('tutorId', tutorId);
  request.input('lowScoreThreshold', thresholds.lowScore);
  request.input('highAbsenceThreshold', thresholds.highAbsence);
  request.input('missingAssignmentsThreshold', thresholds.missingAssignments);
  if (filters.classId && filters.classId !== 'all') {
    request.input('classId', filters.classId);
  }

  const result = await request.query(query);

  return result.recordset.map(row => {
    const reasons: ('low_score' | 'high_absence' | 'missing_assignments')[] = [];
    if (row.averageScore !== null && row.averageScore < thresholds.lowScore) {
      reasons.push('low_score');
    }
    if (row.absentRate > thresholds.highAbsence) {
      reasons.push('high_absence');
    }
    if (row.missingAssignments > thresholds.missingAssignments) {
      reasons.push('missing_assignments');
    }

    return {
      studentId: row.studentId,
      name: row.name,
      email: row.email,
      className: row.className,
      absentSessions: row.absentSessions,
      totalSessions: row.totalSessions,
      absentRate: Math.round((row.absentRate || 0) * 100) / 100,
      missingAssignments: row.missingAssignments,
      averageScore: row.averageScore !== null ? Math.round(row.averageScore * 10) / 10 : null,
      reasons,
    };
  });
}

/**
 * Get list of classes for filter dropdown
 */
export async function getTutorClasses(tutorId: string): Promise<ClassOption[]> {
  const pool = await dbConnection.getPool();

  const query = `
    SELECT 
      c.class_id as classId,
      sub.name + ' - ' + u.name as className,
      sub.name as subjectName,
      u.name as studentName
    FROM Class c
    INNER JOIN Subjects sub ON c.subject_id = sub.subject_id
    INNER JOIN UserAccount u ON c.student_id = u.user_id
    WHERE c.tutor_id = @tutorId
      AND c.status IN ('active', 'completed')
    ORDER BY sub.name, u.name
  `;

  const result = await pool.request()
    .input('tutorId', tutorId)
    .query(query);

  return result.recordset;
}
