/**
 * File: types/note.ts
 * Purpose: Type definitions for Session Notes domain
 * API Alignment: Matches backend /api/sessions/:id/notes endpoints (to be created)
 */

export interface SessionNote {
  note_id: string; // UUID
  session_id: string;
  schedule_id?: string;
  author_id: string; // Tutor ID
  author_name?: string;
  content: string;
  is_visible_to_student: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteDTO {
  session_id: string;
  content: string;
  is_visible_to_student: boolean;
}

export interface UpdateNoteDTO {
  content?: string;
  is_visible_to_student?: boolean;
}

export interface NotesListResponse {
  success: boolean;
  data: SessionNote[];
  count?: number;
}

export interface NoteDetailResponse {
  success: boolean;
  data: SessionNote;
}
