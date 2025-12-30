/**
 * File: types/statistics.types.ts
 * Purpose: Type definitions for Tutor Statistics Dashboard API
 * Description: Contains all interfaces for KPIs, charts, and widgets data
 */

// ===== FILTER TYPES =====
export type TimeFilterType = 'this_week' | 'this_month' | 'last_month' | 'last_3_months' | 'custom';

export interface StatisticsFilters {
  timeFilter: TimeFilterType;
  fromDate?: string; // ISO date string
  toDate?: string;   // ISO date string
  classId?: string;  // 'all' or specific class UUID
}

// ===== KPI OVERVIEW =====
export interface StatisticsOverview {
  // Tổng số buổi đã dạy
  totalSessions: number;
  totalSessionsChangePercent: number; // So với kỳ trước
  
  // Tổng giờ dạy
  totalTeachingHours: number;
  avgHoursPerSession: number;
  
  // Tổng doanh thu
  totalRevenue: number;
  revenueChangeVsPrevPeriod: number; // Chênh lệch VNĐ
  
  // Tỉ lệ hoàn thành buổi học
  sessionCompletionRate: number; // 0-1
  completedSessions: number;
  canceledSessions: number;
  
  // Điểm hài lòng (optional)
  avgSatisfactionScore?: number;
  totalFeedbackCount?: number;
}

// ===== CHART 1: Sessions & Revenue Over Time =====
export interface SessionRevenueDataPoint {
  date: string;        // ISO date or week label
  label: string;       // Display label (e.g., "01/12", "Tuần 1")
  sessions: number;    // Số buổi dạy
  hours: number;       // Tổng số giờ
  revenue: number;     // Doanh thu (VNĐ)
}

export interface SessionsRevenueOverTimeResponse {
  data: SessionRevenueDataPoint[];
  periodType: 'daily' | 'weekly';
  currency: string;
}

// ===== CHART 2: Time Distribution by Class/Subject =====
export interface TimeDistributionItem {
  classId: string;
  className: string;      // e.g., "Tiếng Anh 11A"
  subjectName: string;
  studentName: string;
  sessions: number;
  hours: number;
  revenue: number;
  percentage: number;     // % of total hours
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
  // Submission status percentages
  onTimePercent: number;    // Nộp đúng hạn
  latePercent: number;      // Nộp muộn  
  missingPercent: number;   // Chưa nộp
  // Counts
  totalAssignments: number;
  onTimeCount: number;
  lateCount: number;
  missingCount: number;
  // Score
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
  onTimeSubmissionRate: number;  // 0-1
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
  // Warning indicators
  absentSessions: number;
  totalSessions: number;
  absentRate: number;          // 0-1
  missingAssignments: number;
  averageScore: number | null;
  // Flags for why they need attention
  reasons: ('low_score' | 'high_absence' | 'missing_assignments')[];
}

export interface StudentsNeedingAttentionResponse {
  students: StudentNeedingAttention[];
  thresholds: {
    lowScoreThreshold: number;      // e.g., 6.5
    highAbsenceThreshold: number;   // e.g., 0.2 (20%)
    missingAssignmentsThreshold: number; // e.g., 3
  };
}

// ===== COMBINED RESPONSE =====
export interface FullStatisticsResponse {
  overview: StatisticsOverview;
  sessionsOverTime: SessionsRevenueOverTimeResponse;
  timeDistribution: TimeDistributionResponse;
  learningEffectiveness: LearningEffectivenessResponse;
  topStudents: TopStudentsResponse;
  studentsNeedingAttention: StudentsNeedingAttentionResponse;
}

// ===== CLASS DROPDOWN =====
export interface ClassOption {
  classId: string;
  className: string;
  subjectName: string;
  studentName: string;
}

export interface ClassOptionsResponse {
  classes: ClassOption[];
}
