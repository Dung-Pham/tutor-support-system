/**
 * File: types/statistics.types.ts
 * Purpose: Type definitions for Tutor Statistics Dashboard (Frontend)
 * Description: Mirrored from backend with frontend-specific additions
 */

// ===== FILTER TYPES =====
export type TimeFilterType = 'this_week' | 'this_month' | 'last_month' | 'last_3_months' | 'custom';

export interface StatisticsFilters {
  timeFilter: TimeFilterType;
  fromDate?: string;
  toDate?: string;
  classId?: string;
}

// ===== KPI OVERVIEW =====
export interface StatisticsOverview {
  totalSessions: number;
  totalSessionsChangePercent: number;
  totalTeachingHours: number;
  avgHoursPerSession: number;
  totalRevenue: number;
  revenueChangeVsPrevPeriod: number;
  sessionCompletionRate: number;
  completedSessions: number;
  canceledSessions: number;
  avgSatisfactionScore?: number;
  totalFeedbackCount?: number;
}

// ===== CHART 1: Sessions & Revenue Over Time =====
export interface SessionRevenueDataPoint {
  date: string;
  label: string;
  sessions: number;
  hours: number;
  revenue: number;
}

export interface SessionsRevenueOverTimeResponse {
  data: SessionRevenueDataPoint[];
  periodType: 'daily' | 'weekly';
  currency: string;
}

// ===== CHART 2: Time Distribution by Class/Subject =====
export interface TimeDistributionItem {
  classId: string;
  className: string;
  subjectName: string;
  studentName: string;
  sessions: number;
  hours: number;
  revenue: number;
  percentage: number;
}

export interface TimeDistributionResponse {
  data: TimeDistributionItem[];
  totalHours: number;
  totalRevenue: number;
  totalSessions: number;
}

// ===== CHART 3: Learning Effectiveness =====
export interface LearningEffectivenessItem {
  classId: string;
  className: string;
  studentName: string;
  onTimePercent: number;
  latePercent: number;
  missingPercent: number;
  totalAssignments: number;
  onTimeCount: number;
  lateCount: number;
  missingCount: number;
  averageScore: number | null;
}

export interface LearningEffectivenessResponse {
  data: LearningEffectivenessItem[];
  overallOnTimePercent: number;
  overallLatePercent: number;
  overallMissingPercent: number;
  overallAverageScore: number | null;
}

// ===== WIDGET: Top Students =====
export interface TopStudent {
  studentId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  averageScore: number;
  onTimeSubmissionRate: number;
  attendedSessions: number;
  totalSessions: number;
  rank: number;
}

export interface TopStudentsResponse {
  students: TopStudent[];
  period: string;
}

// ===== WIDGET: Students Needing Attention =====
export interface StudentNeedingAttention {
  studentId: string;
  name: string;
  email: string;
  className: string;
  absentSessions: number;
  totalSessions: number;
  absentRate: number;
  missingAssignments: number;
  averageScore: number | null;
  reasons: ('low_score' | 'high_absence' | 'missing_assignments')[];
}

export interface StudentsNeedingAttentionResponse {
  students: StudentNeedingAttention[];
  thresholds: {
    lowScoreThreshold: number;
    highAbsenceThreshold: number;
    missingAssignmentsThreshold: number;
  };
}

// ===== CLASS DROPDOWN =====
export interface ClassOption {
  classId: string;
  className: string;
  subjectName: string;
  studentName: string;
}

// ===== COMBINED API RESPONSE =====
export interface FullStatisticsApiResponse {
  success: boolean;
  data: {
    overview: StatisticsOverview;
    sessionsOverTime: SessionsRevenueOverTimeResponse;
    timeDistribution: TimeDistributionResponse;
    learningEffectiveness: LearningEffectivenessResponse;
    topStudents: TopStudentsResponse;
    studentsNeedingAttention: StudentsNeedingAttentionResponse;
    classes: ClassOption[];
  };
  filters: StatisticsFilters;
}

// ===== INDIVIDUAL API RESPONSES =====
export interface OverviewApiResponse {
  success: boolean;
  data: StatisticsOverview;
  filters: StatisticsFilters;
}

export interface SessionsOverTimeApiResponse {
  success: boolean;
  data: SessionRevenueDataPoint[];
  periodType: 'daily' | 'weekly';
  currency: string;
  filters: StatisticsFilters;
}

export interface TimeDistributionApiResponse {
  success: boolean;
  data: TimeDistributionItem[];
  totalHours: number;
  totalRevenue: number;
  totalSessions: number;
  filters: StatisticsFilters;
}

export interface LearningEffectivenessApiResponse {
  success: boolean;
  data: LearningEffectivenessItem[];
  overallOnTimePercent: number;
  overallLatePercent: number;
  overallMissingPercent: number;
  overallAverageScore: number | null;
  filters: StatisticsFilters;
}

export interface TopStudentsApiResponse {
  success: boolean;
  students: TopStudent[];
  period: string;
  filters: StatisticsFilters;
}

export interface StudentsNeedingAttentionApiResponse {
  success: boolean;
  students: StudentNeedingAttention[];
  thresholds: {
    lowScoreThreshold: number;
    highAbsenceThreshold: number;
    missingAssignmentsThreshold: number;
  };
  filters: StatisticsFilters;
}

export interface ClassOptionsApiResponse {
  success: boolean;
  classes: ClassOption[];
}
