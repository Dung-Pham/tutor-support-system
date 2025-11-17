/**
 * File: services/sessionService.ts
 * Purpose: API service for Session/Schedule operations
 * API Endpoints: Based on backend /api/sessions and /api/schedules
 * Usage: Import and call methods from components/Redux thunks
 */

import { apiClient } from './api';
import type {
  Session,
  CreateSessionDTO,
  UpdateSessionDTO,
  SessionsListResponse,
  SessionDetailResponse,
} from '../types/session';

/**
 * Get all sessions with optional filters
 * @param params - Query parameters (userId, tutorId, date range, pagination)
 */
export const getSessions = async (params?: {
  userId?: string;
  tutorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<SessionsListResponse> => {
  const response = await apiClient.get<SessionsListResponse>('/sessions', { params });
  return response.data;
};

/**
 * Get session detail by ID
 * @param sessionId - Session UUID
 */
export const getSessionById = async (sessionId: string): Promise<SessionDetailResponse> => {
  const response = await apiClient.get<SessionDetailResponse>(`/sessions/${sessionId}`);
  return response.data;
};

/**
 * Create new session (Tutor only)
 * @param data - Session creation data
 */
export const createSession = async (data: CreateSessionDTO): Promise<SessionDetailResponse> => {
  const response = await apiClient.post<SessionDetailResponse>('/sessions', data);
  return response.data;
};

/**
 * Update session (status, notes, etc.)
 * @param sessionId - Session UUID
 * @param data - Update payload
 */
export const updateSession = async (
  sessionId: string,
  data: UpdateSessionDTO
): Promise<SessionDetailResponse> => {
  const response = await apiClient.put<SessionDetailResponse>(`/sessions/${sessionId}`, data);
  return response.data;
};

/**
 * Delete session
 * @param sessionId - Session UUID
 */
export const deleteSession = async (sessionId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/sessions/${sessionId}`);
  return response.data;
};

/**
 * Get calendar view (weekly/monthly)
 * Matches backend GET /api/schedules/calendar endpoint
 * @param params - userId, userRole, viewType, date
 */
export const getCalendarView = async (params: {
  userId: string;
  userRole: 'tutor' | 'user';
  viewType: 'week' | 'month';
  date: string; // YYYY-MM-DD
}): Promise<SessionsListResponse> => {
  const response = await apiClient.get<SessionsListResponse>('/schedules/calendar', { params });
  return response.data;
};
