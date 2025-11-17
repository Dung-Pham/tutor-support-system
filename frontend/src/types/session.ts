/**
 * File: types/session.ts
 * Purpose: Type definitions for Session (Schedule) domain
 * API Alignment: Matches backend /api/sessions and /api/schedules endpoints
 */

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Session {
  session_id?: string; // UUID - for MongoDB sessions
  schedule_id?: string; // UUID - for SQL Server schedules
  tutor_id: string;
  student_id: string; // Could be user_id in new schema
  class_id?: string;
  subject: string;
  title?: string;
  description?: string;
  scheduled_at: string; // ISO 8601 date-time
  start_date?: string; // For SQL Server schedules
  end_date?: string;
  duration: number; // Minutes
  status: SessionStatus;
  location?: string;
  meeting_link?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSessionDTO {
  tutor_id: string;
  student_id: string;
  class_id?: string;
  subject: string;
  title?: string;
  description?: string;
  scheduled_at: string;
  duration: number;
  location?: string;
  meeting_link?: string;
}

export interface UpdateSessionDTO {
  status?: SessionStatus;
  notes?: string;
  scheduled_at?: string;
  duration?: number;
  location?: string;
  meeting_link?: string;
}

export interface SessionsListResponse {
  success: boolean;
  data: Session[];
  count?: number;
  page?: number;
  limit?: number;
}

export interface SessionDetailResponse {
  success: boolean;
  data: Session;
}
