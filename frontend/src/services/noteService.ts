/**
 * File: services/noteService.ts
 * Purpose: API service for Session Notes operations
 * API Endpoints: Based on backend /api/sessions/:id/notes (to be implemented)
 * Usage: Import and call methods from components/Redux thunks
 */

import { apiClient } from './api';
import type {
  SessionNote,
  CreateNoteDTO,
  UpdateNoteDTO,
  NotesListResponse,
  NoteDetailResponse,
} from '../types/note';

/**
 * Get notes for a session
 * @param sessionId - Session UUID
 */
export const getNotesBySession = async (sessionId: string): Promise<NotesListResponse> => {
  const response = await apiClient.get<NotesListResponse>(`/sessions/${sessionId}/notes`);
  return response.data;
};

/**
 * Get note detail by ID
 * @param noteId - Note UUID
 */
export const getNoteById = async (noteId: string): Promise<NoteDetailResponse> => {
  const response = await apiClient.get<NoteDetailResponse>(`/notes/${noteId}`);
  return response.data;
};

/**
 * Create session note (Tutor only)
 * @param data - Note content and visibility
 */
export const createNote = async (data: CreateNoteDTO): Promise<NoteDetailResponse> => {
  const response = await apiClient.post<NoteDetailResponse>('/notes', data);
  return response.data;
};

/**
 * Update session note (Tutor only)
 * @param noteId - Note UUID
 * @param data - Updated content/visibility
 */
export const updateNote = async (
  noteId: string,
  data: UpdateNoteDTO
): Promise<NoteDetailResponse> => {
  const response = await apiClient.put<NoteDetailResponse>(`/notes/${noteId}`, data);
  return response.data;
};

/**
 * Delete session note (Tutor only)
 * @param noteId - Note UUID
 */
export const deleteNote = async (noteId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/notes/${noteId}`);
  return response.data;
};
