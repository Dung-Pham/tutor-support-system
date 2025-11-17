/**
 * File: store/slices/sessionsSlice.ts
 * Purpose: Redux slice for Sessions/Schedules state management
 * Features: Async thunks for API calls, loading states, error handling
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Session, CreateSessionDTO, UpdateSessionDTO } from '../../types/session';
import * as sessionService from '../../services/sessionService';

interface SessionsState {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: SessionsState = {
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchSessions = createAsyncThunk(
  'sessions/fetchSessions',
  async (params?: {
    userId?: string;
    tutorId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await sessionService.getSessions(params);
    return response;
  }
);

export const fetchSessionById = createAsyncThunk(
  'sessions/fetchSessionById',
  async (sessionId: string) => {
    const response = await sessionService.getSessionById(sessionId);
    return response.data;
  }
);

export const createSession = createAsyncThunk(
  'sessions/createSession',
  async (data: CreateSessionDTO) => {
    const response = await sessionService.createSession(data);
    return response.data;
  }
);

export const updateSession = createAsyncThunk(
  'sessions/updateSession',
  async ({ sessionId, data }: { sessionId: string; data: UpdateSessionDTO }) => {
    const response = await sessionService.updateSession(sessionId, data);
    return response.data;
  }
);

export const deleteSession = createAsyncThunk(
  'sessions/deleteSession',
  async (sessionId: string) => {
    await sessionService.deleteSession(sessionId);
    return sessionId;
  }
);

export const fetchCalendarView = createAsyncThunk(
  'sessions/fetchCalendarView',
  async (params: {
    userId: string;
    userRole: 'tutor' | 'user';
    viewType: 'week' | 'month';
    date: string;
  }) => {
    const response = await sessionService.getCalendarView(params);
    return response;
  }
);

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch sessions
    builder.addCase(fetchSessions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSessions.fulfilled, (state, action) => {
      state.loading = false;
      state.sessions = action.payload.data;
      state.pagination.total = action.payload.count || 0;
    });
    builder.addCase(fetchSessions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch sessions';
    });

    // Fetch session by ID
    builder.addCase(fetchSessionById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSessionById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSession = action.payload;
    });
    builder.addCase(fetchSessionById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch session';
    });

    // Create session
    builder.addCase(createSession.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createSession.fulfilled, (state, action) => {
      state.loading = false;
      state.sessions.unshift(action.payload);
    });
    builder.addCase(createSession.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create session';
    });

    // Update session
    builder.addCase(updateSession.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateSession.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.sessions.findIndex(
        (s) => s.session_id === action.payload.session_id || s.schedule_id === action.payload.schedule_id
      );
      if (index !== -1) {
        state.sessions[index] = action.payload;
      }
      if (state.currentSession?.session_id === action.payload.session_id) {
        state.currentSession = action.payload;
      }
    });
    builder.addCase(updateSession.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update session';
    });

    // Delete session
    builder.addCase(deleteSession.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteSession.fulfilled, (state, action) => {
      state.loading = false;
      state.sessions = state.sessions.filter(
        (s) => s.session_id !== action.payload && s.schedule_id !== action.payload
      );
    });
    builder.addCase(deleteSession.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete session';
    });

    // Fetch calendar view
    builder.addCase(fetchCalendarView.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCalendarView.fulfilled, (state, action) => {
      state.loading = false;
      state.sessions = action.payload.data;
    });
    builder.addCase(fetchCalendarView.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch calendar view';
    });
  },
});

export const { clearCurrentSession, clearError } = sessionsSlice.actions;
export default sessionsSlice.reducer;
