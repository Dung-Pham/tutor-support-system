/**
 * File: types/submission.ts
 * Purpose: Type definitions for Assignment Submission domain
 * API Alignment: Matches backend /api/submissions endpoints (to be created)
 */

export type SubmissionStatus = 'pending' | 'submitted' | 'graded' | 'late';

export interface Submission {
  submission_id: string; // UUID
  assignment_id: string;
  student_id: string;
  student_name?: string;
  submitted_at?: string; // ISO 8601
  submission_files?: string[]; // File URLs
  comments?: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  graded_at?: string;
  graded_by?: string; // Tutor ID
  created_at: string;
  updated_at: string;
}

export interface CreateSubmissionDTO {
  assignment_id: string;
  submission_files: File[];
  comments?: string;
}

export interface UpdateSubmissionDTO {
  submission_files?: File[];
  comments?: string;
}

export interface GradeSubmissionDTO {
  score: number;
  feedback?: string;
}

export interface SubmissionsListResponse {
  success: boolean;
  data: Submission[];
  count?: number;
}

export interface SubmissionDetailResponse {
  success: boolean;
  data: Submission;
}
