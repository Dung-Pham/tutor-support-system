/**
 * File: store/slices/assignmentsSlice.ts
 * Purpose: Redux slice for Assignments state management
 * Features: Async thunks for CRUD operations, loading states, error handling
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Assignment, CreateAssignmentDTO, UpdateAssignmentDTO } from '../../types/assignment';
import * as assignmentService from '../../services/assignmentService';

interface AssignmentsState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: AssignmentsState = {
  assignments: [],
  currentAssignment: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAssignments',
  async (params?: {
    classId?: string;
    tutorId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await assignmentService.getAssignments(params);
    return response;
  }
);

export const fetchAssignmentById = createAsyncThunk(
  'assignments/fetchAssignmentById',
  async (assignmentId: string) => {
    const response = await assignmentService.getAssignmentById(assignmentId);
    return response.data;
  }
);

export const createAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async (data: CreateAssignmentDTO) => {
    const response = await assignmentService.createAssignment(data);
    return response.data;
  }
);

export const updateAssignment = createAsyncThunk(
  'assignments/updateAssignment',
  async ({ assignmentId, data }: { assignmentId: string; data: UpdateAssignmentDTO }) => {
    const response = await assignmentService.updateAssignment(assignmentId, data);
    return response.data;
  }
);

export const deleteAssignment = createAsyncThunk(
  'assignments/deleteAssignment',
  async (assignmentId: string) => {
    await assignmentService.deleteAssignment(assignmentId);
    return assignmentId;
  }
);

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch assignments
    builder.addCase(fetchAssignments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAssignments.fulfilled, (state, action) => {
      state.loading = false;
      state.assignments = action.payload.data;
      state.pagination.total = action.payload.count || 0;
    });
    builder.addCase(fetchAssignments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch assignments';
    });

    // Fetch assignment by ID
    builder.addCase(fetchAssignmentById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAssignmentById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentAssignment = action.payload;
    });
    builder.addCase(fetchAssignmentById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch assignment';
    });

    // Create assignment
    builder.addCase(createAssignment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createAssignment.fulfilled, (state, action) => {
      state.loading = false;
      state.assignments.unshift(action.payload);
    });
    builder.addCase(createAssignment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create assignment';
    });

    // Update assignment
    builder.addCase(updateAssignment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAssignment.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.assignments.findIndex((a) => a.assignment_id === action.payload.assignment_id);
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
      if (state.currentAssignment?.assignment_id === action.payload.assignment_id) {
        state.currentAssignment = action.payload;
      }
    });
    builder.addCase(updateAssignment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update assignment';
    });

    // Delete assignment
    builder.addCase(deleteAssignment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteAssignment.fulfilled, (state, action) => {
      state.loading = false;
      state.assignments = state.assignments.filter((a) => a.assignment_id !== action.payload);
    });
    builder.addCase(deleteAssignment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete assignment';
    });
  },
});

export const { clearCurrentAssignment, clearError } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;
