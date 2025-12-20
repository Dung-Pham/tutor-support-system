/**
 * File: types/index.ts
 * Mục đích: Định nghĩa các types và interfaces chung cho toàn bộ backend
 * Vai trò: Cung cấp type safety cho TypeScript
 */

import { Request, Response, NextFunction } from 'express';

// ============ Common Types ============

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | any[];
  timestamp?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// ============ Schedule Types ============
// Matches tutorsupportdb_merged-v2.sql schema

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday, 6=Saturday

export interface Schedule {
  schedule_id: string;      // UNIQUEIDENTIFIER
  class_id: string;         // FK to Class
  day_of_week: DayOfWeek;   // 0-6
  start_time: string;       // TIME format HH:mm:ss
  end_time: string;         // TIME format HH:mm:ss
  duration_minutes: number;
  is_active: boolean;
  created_at: Date;
  updated_at?: Date;
  // Joined fields
  tutor_id?: string;
  student_id?: string;
  subject_name?: string;
  tutor_name?: string;
  student_name?: string;
  startDate?: Date;        // Class start date
  endDate?: Date;          // Class end date
}

export interface CreateScheduleDTO {
  class_id: string;
  day_of_week: DayOfWeek;
  start_time: string;       // HH:mm or HH:mm:ss
  end_time: string;         // HH:mm or HH:mm:ss
  duration_minutes?: number;
  is_active?: boolean;
}

export interface UpdateScheduleDTO {
  day_of_week?: DayOfWeek;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  is_active?: boolean;
}

export interface CalendarViewParams {
  userId: string;
  userRole: 'tutor' | 'student';
  viewType: 'day' | 'week' | 'month';
  date: Date;
}

// ============ Reschedule Types ============

export enum RescheduleStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export interface RescheduleRequest {
  rescheduleId: number;
  scheduleId: number;
  requestedBy: number; // userId
  reason: string;
  proposedStartTime: Date;
  proposedEndTime: Date;
  status: RescheduleStatus;
  reviewedBy?: number;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRescheduleDTO {
  scheduleId: number;
  reason: string;
  proposedStartTime: Date;
  proposedEndTime: Date;
}

export interface ReviewRescheduleDTO {
  status: 'approved' | 'rejected';
  reviewNotes?: string;
}

// ============ Attendance Types ============
// Matches tutorsupportdb_merged-v2.sql schema

export type AttendanceOverallStatus = 'PENDING' | 'CONFIRMED' | 'ABSENT' | 'CANCELLED';

export interface AttendanceRecord {
  attendance_id: string;        // UNIQUEIDENTIFIER
  class_id: string;             // FK to Class
  schedule_id: string;          // FK to Schedule
  session_date: string;         // DATE format YYYY-MM-DD
  tutor_confirmed: boolean;
  tutor_confirmed_at?: Date;
  tutor_notes?: string;
  student_confirmed: boolean;   // Changed from user_confirmed
  student_confirmed_at?: Date;
  student_notes?: string;       // Changed from user_notes
  overall_status: AttendanceOverallStatus;
  created_at: Date;
  updated_at?: Date;
  // Joined fields
  tutor_name?: string;
  student_name?: string;
  subject_name?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
}

export interface CreateAttendanceDTO {
  class_id: string;
  schedule_id: string;
  session_date: string;         // YYYY-MM-DD
}

export interface UpdateAttendanceDTO {
  overall_status?: AttendanceOverallStatus;
  tutor_notes?: string;
  student_notes?: string;
}

export interface ConfirmAttendanceDTO {
  confirmedBy: 'tutor' | 'student';
  notes?: string;
}

// ============ Progress Evaluation Types ============

export interface ProgressEvaluation {
  evaluationId: number;
  scheduleId: number;
  tutorId: number;
  studentId: number;
  subjectId: number;
  understanding: number; // 1-5 scale
  participation: number; // 1-5 scale
  homework: number; // 1-5 scale
  behavior: number; // 1-5 scale
  overallScore: number; // Average of above
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  notes?: string;
  createdAt: Date;
}

export interface CreateEvaluationDTO {
  scheduleId: number;
  understanding: number;
  participation: number;
  homework: number;
  behavior: number;
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  notes?: string;
}

export interface ProgressStatistics {
  statisticsId: number;
  studentId: number;
  subjectId: number;
  month: number;
  year: number;
  totalClasses: number;
  attendedClasses: number;
  attendanceRate: number;
  averageScore: number;
  totalHomework: number;
  completedHomework: number;
  homeworkCompletionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Material & Homework Types ============

export enum MaterialType {
  PDF = 'pdf',
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  LINK = 'link'
}

export interface Material {
  materialId: number;
  scheduleId?: number;
  subjectId: number;
  uploadedBy: number; // tutorId
  title: string;
  description?: string;
  type: MaterialType;
  fileUrl: string;
  fileSize?: number;
  createdAt: Date;
}

export interface UploadMaterialDTO {
  scheduleId?: number;
  subjectId: number;
  title: string;
  description?: string;
  type: MaterialType;
  fileUrl: string;
  fileSize?: number;
}

export enum HomeworkStatus {
  ASSIGNED = 'assigned',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  LATE = 'late'
}

export interface Homework {
  homeworkId: number;
  scheduleId: number;
  tutorId: number;
  title: string;
  description: string;
  dueDate: Date;
  maxScore: number;
  attachments?: string; // JSON array of file URLs
  createdAt: Date;
}

export interface CreateHomeworkDTO {
  scheduleId: number;
  title: string;
  description: string;
  dueDate: Date;
  maxScore: number;
  attachments?: string[];
}

export interface HomeworkSubmission {
  submissionId: number;
  homeworkId: number;
  studentId: number;
  submittedAt: Date;
  attachments?: string; // JSON array of file URLs
  notes?: string;
  score?: number;
  feedback?: string;
  gradedAt?: Date;
  status: HomeworkStatus;
}

export interface SubmitHomeworkDTO {
  attachments?: string[];
  notes?: string;
}

export interface GradeHomeworkDTO {
  score: number;
  feedback?: string;
}

// ============ Chat & Notification Types ============

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
  SYSTEM = 'system'
}

export interface ChatMessage {
  messageId: number;
  senderId: number;
  receiverId: number;
  scheduleId?: number;
  messageType: MessageType;
  content: string;
  attachments?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface SendMessageDTO {
  receiverId: number;
  scheduleId?: number;
  messageType: MessageType;
  content: string;
  attachments?: string[];
}

export enum NotificationType {
  SCHEDULE_CREATED = 'schedule_created',
  SCHEDULE_UPDATED = 'schedule_updated',
  SCHEDULE_CANCELLED = 'schedule_cancelled',
  RESCHEDULE_REQUEST = 'reschedule_request',
  RESCHEDULE_APPROVED = 'reschedule_approved',
  RESCHEDULE_REJECTED = 'reschedule_rejected',
  ATTENDANCE_CONFIRMED = 'attendance_confirmed',
  HOMEWORK_ASSIGNED = 'homework_assigned',
  HOMEWORK_SUBMITTED = 'homework_submitted',
  HOMEWORK_GRADED = 'homework_graded',
  EVALUATION_CREATED = 'evaluation_created',
  MESSAGE_RECEIVED = 'message_received'
}

export interface Notification {
  notificationId: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: string; // JSON data
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface CreateNotificationDTO {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

// ============ Express Extended Types ============

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string; // UUID
    role: string;
    email: string;
  };
  body: any;
  params: any;
  query: any;
}

export type AsyncRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;
