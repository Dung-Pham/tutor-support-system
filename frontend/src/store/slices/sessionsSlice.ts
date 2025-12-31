/**
 * File: store/slices/sessionsSlice.ts
 * Purpose: Redux slice for Schedules state management (Weekly Recurring Templates)
 * Features: Async thunks for API calls, loading states, error handling
 * 
 * Schedule is a weekly recurring template with day_of_week, start_time, end_time
 * SessionInstance is a specific occurrence on a date
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {
  Schedule,
  SessionInstance,
  CreateScheduleDTO,
  UpdateScheduleDTO,
} from '../../types/session';
import * as sessionService from '../../services/sessionService';

interface SchedulesState {
  schedules: Schedule[];
  sessionInstances: SessionInstance[];
  currentSchedule: Schedule | null;
  loading: boolean;
  error: string | null;
  weekStart: string | null;
  weekEnd: string | null;
}

const initialState: SchedulesState = {
  schedules: [],
  sessionInstances: [],
  currentSchedule: null,
  loading: false,
  error: null,
  weekStart: null,
  weekEnd: null,
};

// ============= ASYNC THUNKS =============

// Schedule Template CRUD
export const fetchSchedulesByClass = createAsyncThunk(
  'schedules/fetchByClass',
  async (classId: string) => {
    const response = await sessionService.getSchedulesByClass(classId);
    return response;
  }
);

export const fetchAllSchedules = createAsyncThunk('schedules/fetchAll', async () => {
  const response = await sessionService.getAllSchedules();
  return response;
});

export const fetchScheduleById = createAsyncThunk(
  'schedules/fetchById',
  async (scheduleId: string) => {
    return await sessionService.getScheduleById(scheduleId);
  }
);

export const createSchedule = createAsyncThunk(
  'schedules/create',
  async (data: CreateScheduleDTO) => {
    return await sessionService.createSchedule(data);
  }
);

export const updateSchedule = createAsyncThunk(
  'schedules/update',
  async ({ scheduleId, data }: { scheduleId: string; data: UpdateScheduleDTO }) => {
    return await sessionService.updateSchedule(scheduleId, data);
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedules/delete',
  async (scheduleId: string) => {
    await sessionService.deleteSchedule(scheduleId);
    return scheduleId;
  }
);

// Session Instances (specific dates)
export const fetchSessionsByDate = createAsyncThunk(
  'schedules/fetchSessionsByDate',
  async (params: { date: string; userId?: string; role?: 'tutor' | 'student' }) => {
    const response = await sessionService.getSessionsByDate(
      params.date,
      params.userId,
      params.role
    );
    return response;
  }
);

export const fetchSessionsByWeek = createAsyncThunk(
  'schedules/fetchSessionsByWeek',
  async (params: { weekStartDate: string; userId?: string; role?: 'tutor' | 'student' }) => {
    return await sessionService.getSessionsByWeek(
      params.weekStartDate,
      params.userId,
      params.role
    );
  }
);

export const fetchWeeklyTemplate = createAsyncThunk(
  'schedules/fetchWeeklyTemplate',
  async () => {
    const response = await sessionService.getWeeklyTemplate();
    return response;
  }
);

export const fetchCalendarView = createAsyncThunk(
  'schedules/fetchCalendarView',
  async (params: { viewType: 'week' | 'month'; date: string }) => {
    const response = await sessionService.getCalendarView(params);
    return response;
  }
);

// ============= SLICE =============

const schedulesSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    clearCurrentSchedule: (state) => {
      state.currentSchedule = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSessionInstances: (state) => {
      state.sessionInstances = [];
      state.weekStart = null;
      state.weekEnd = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch schedules by class
    builder.addCase(fetchSchedulesByClass.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSchedulesByClass.fulfilled, (state, action) => {
      state.loading = false;
      state.schedules = action.payload.data;
    });
    builder.addCase(fetchSchedulesByClass.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch schedules';
    });

    // Fetch all schedules
    builder.addCase(fetchAllSchedules.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllSchedules.fulfilled, (state, action) => {
      state.loading = false;
      state.schedules = action.payload.data;
    });
    builder.addCase(fetchAllSchedules.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch schedules';
    });

    // Fetch schedule by ID
    builder.addCase(fetchScheduleById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchScheduleById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSchedule = action.payload;
    });
    builder.addCase(fetchScheduleById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch schedule';
    });

    // Create schedule
    builder.addCase(createSchedule.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createSchedule.fulfilled, (state, action) => {
      state.loading = false;
      state.schedules.push(...action.payload);
    });
    builder.addCase(createSchedule.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create schedule';
    });

    // Update schedule
    builder.addCase(updateSchedule.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateSchedule.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.schedules.findIndex((s) => s.schedule_id === action.payload.schedule_id);
      if (index !== -1) {
        state.schedules[index] = action.payload;
      }
      if (state.currentSchedule?.schedule_id === action.payload.schedule_id) {
        state.currentSchedule = action.payload;
      }
    });
    builder.addCase(updateSchedule.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update schedule';
    });

    // Delete schedule
    builder.addCase(deleteSchedule.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteSchedule.fulfilled, (state, action) => {
      state.loading = false;
      state.schedules = state.schedules.filter(
        (s) => s.schedule_id !== action.payload
      );
    });
    builder.addCase(deleteSchedule.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete schedule';
    });

    // Fetch sessions by date
    builder.addCase(fetchSessionsByDate.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSessionsByDate.fulfilled, (state, action) => {
      state.loading = false;
      state.sessionInstances = action.payload.data;
    });
    builder.addCase(fetchSessionsByDate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch sessions';
    });

    // Fetch sessions by week
    builder.addCase(fetchSessionsByWeek.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSessionsByWeek.fulfilled, (state, action) => {
      state.loading = false;
      state.sessionInstances = action.payload.sessions;
      state.weekStart = action.payload.weekStartDate;
    });
    builder.addCase(fetchSessionsByWeek.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch weekly sessions';
    });

    // Fetch weekly template
    builder.addCase(fetchWeeklyTemplate.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWeeklyTemplate.fulfilled, (state, action) => {
      state.loading = false;
      state.schedules = action.payload.data;
    });
    builder.addCase(fetchWeeklyTemplate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch weekly template';
    });

    // Fetch calendar view
    builder.addCase(fetchCalendarView.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCalendarView.fulfilled, (state, action) => {
      state.loading = false;
      state.sessionInstances = action.payload.data.sessions;
      state.weekStart = action.payload.data.weekStartDate;
    });
    builder.addCase(fetchCalendarView.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch calendar view';
    });
  },
});

export const { clearCurrentSchedule, clearError, clearSessionInstances } =
  schedulesSlice.actions;

// Legacy exports for backward compatibility
export const fetchSessions = fetchAllSchedules;
export const fetchSessionById = fetchScheduleById;
export const createSession = createSchedule;
export const updateSession = updateSchedule;
export const deleteSession = deleteSchedule;
export const clearCurrentSession = clearCurrentSchedule;

export default schedulesSlice.reducer;
