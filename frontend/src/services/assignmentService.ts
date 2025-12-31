/**
 * File: services/assignmentService.ts
 * Purpose: API service for Assignment operations
 * API Endpoints: Based on backend /api/assignments (to be implemented)
 * Usage: Import and call methods from components/Redux thunks
 */

import { apiClient } from './api';
import type {
  Assignment,
  CreateAssignmentDTO,
  UpdateAssignmentDTO,
  AssignmentsListResponse,
  AssignmentDetailResponse,
} from '../types/assignment';

/**
 * Get all assignments with optional filters
 * @param params - Query parameters (classId, tutorId, status, pagination)
 */
export const getAssignments = async (params?: {
  classId?: string;
  tutorId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AssignmentsListResponse> => {
  const response = await apiClient.get<AssignmentsListResponse>('/assignments', { params });
  return response.data;
};

/**
 * Get assignment detail by ID
 * @param assignmentId - Assignment UUID
 */
export const getAssignmentById = async (assignmentId: string): Promise<AssignmentDetailResponse> => {
  const response = await apiClient.get<AssignmentDetailResponse>(`/assignments/${assignmentId}`);
  return response.data;
};

/**
 * Create new assignment (Tutor only)
 * @param data - Assignment creation data with optional file uploads
 */
export const createAssignment = async (data: CreateAssignmentDTO): Promise<AssignmentDetailResponse> => {
  const formData = new FormData();
  formData.append('class_id', data.class_id);
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('due_date', data.due_date);
  if (data.max_score) formData.append('max_score', data.max_score.toString());
  
  // Append files if provided
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }

  const response = await apiClient.post<AssignmentDetailResponse>('/assignments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Update assignment (Tutor only)
 * @param assignmentId - Assignment UUID
 * @param data - Update payload
 */
export const updateAssignment = async (
  assignmentId: string,
  data: UpdateAssignmentDTO
): Promise<AssignmentDetailResponse> => {
  const response = await apiClient.put<AssignmentDetailResponse>(`/assignments/${assignmentId}`, data);
  return response.data;
};

/**
 * Delete assignment (Tutor only)
 * @param assignmentId - Assignment UUID
 */
export const deleteAssignment = async (assignmentId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/assignments/${assignmentId}`);
  return response.data;
};
