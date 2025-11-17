/**
 * File: services/submissionService.ts
 * Purpose: API service for Assignment Submission operations
 * API Endpoints: Based on backend /api/submissions and /api/assignments/:id/submit
 * Usage: Import and call methods from components/Redux thunks
 */

import { apiClient } from './api';
import type {
  Submission,
  CreateSubmissionDTO,
  UpdateSubmissionDTO,
  GradeSubmissionDTO,
  SubmissionsListResponse,
  SubmissionDetailResponse,
} from '../types/submission';

/**
 * Get all submissions for an assignment (Tutor view)
 * @param assignmentId - Assignment UUID
 */
export const getSubmissionsByAssignment = async (
  assignmentId: string
): Promise<SubmissionsListResponse> => {
  const response = await apiClient.get<SubmissionsListResponse>(
    `/assignments/${assignmentId}/submissions`
  );
  return response.data;
};

/**
 * Get my submissions (Student view)
 * @param assignmentId - Assignment UUID
 */
export const getMySubmission = async (assignmentId: string): Promise<SubmissionDetailResponse> => {
  const response = await apiClient.get<SubmissionDetailResponse>(
    `/assignments/${assignmentId}/submissions/me`
  );
  return response.data;
};

/**
 * Get submission detail by ID
 * @param submissionId - Submission UUID
 */
export const getSubmissionById = async (submissionId: string): Promise<SubmissionDetailResponse> => {
  const response = await apiClient.get<SubmissionDetailResponse>(`/submissions/${submissionId}`);
  return response.data;
};

/**
 * Submit assignment (Student)
 * @param assignmentId - Assignment UUID
 * @param data - Submission files + comments
 */
export const submitAssignment = async (
  assignmentId: string,
  data: CreateSubmissionDTO
): Promise<SubmissionDetailResponse> => {
  const formData = new FormData();
  data.submission_files.forEach((file) => {
    formData.append('files', file);
  });
  if (data.comments) formData.append('comments', data.comments);

  const response = await apiClient.post<SubmissionDetailResponse>(
    `/assignments/${assignmentId}/submit`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

/**
 * Update submission (Re-submit before due date)
 * @param submissionId - Submission UUID
 * @param data - Updated files + comments
 */
export const updateSubmission = async (
  submissionId: string,
  data: UpdateSubmissionDTO
): Promise<SubmissionDetailResponse> => {
  const formData = new FormData();
  if (data.submission_files && data.submission_files.length > 0) {
    data.submission_files.forEach((file) => {
      formData.append('files', file);
    });
  }
  if (data.comments) formData.append('comments', data.comments);

  const response = await apiClient.put<SubmissionDetailResponse>(`/submissions/${submissionId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Grade submission (Tutor only)
 * @param submissionId - Submission UUID
 * @param data - Score + feedback
 */
export const gradeSubmission = async (
  submissionId: string,
  data: GradeSubmissionDTO
): Promise<SubmissionDetailResponse> => {
  const response = await apiClient.post<SubmissionDetailResponse>(
    `/submissions/${submissionId}/grade`,
    data
  );
  return response.data;
};
