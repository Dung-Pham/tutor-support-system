/**
 * File: types/assignment.ts
 * Purpose: Type definitions for Assignment domain
 * API Alignment: Matches backend /api/assignments endpoints (to be created)
 */

export type AssignmentStatus = 'draft' | 'published' | 'closed';

export interface Assignment {
  assignment_id: string; // UUID
  class_id: string;
  tutor_id: string;
  title: string;
  description: string;
  due_date: string; // ISO 8601
  max_score?: number;
  status: AssignmentStatus;
  attachments?: string[]; // File URLs
  created_at: string;
  updated_at: string;
  submissions_count?: number;
  graded_count?: number;
}

export interface CreateAssignmentDTO {
  class_id: string;
  title: string;
  description: string;
  due_date: string;
  max_score?: number;
  attachments?: File[];
}

export interface UpdateAssignmentDTO {
  title?: string;
  description?: string;
  due_date?: string;
  max_score?: number;
  status?: AssignmentStatus;
}

export interface AssignmentsListResponse {
  success: boolean;
  data: Assignment[];
  count?: number;
  page?: number;
  limit?: number;
}

export interface AssignmentDetailResponse {
  success: boolean;
  data: Assignment;
}
