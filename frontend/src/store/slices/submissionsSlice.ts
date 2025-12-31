/**
 * File: store/slices/submissionsSlice.ts
 * Purpose: Redux slice for Submissions state management
 * Features: Async thunks for submit/grade operations, loading states
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Submission, CreateSubmissionDTO, GradeSubmissionDTO } from '../../types/submission';
import * as submissionService from '../../services/submissionService';

interface SubmissionsState {
  submissions: Submission[];
  currentSubmission: Submission | null;
  mySubmission: Submission | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubmissionsState = {
  submissions: [],
  currentSubmission: null,
  mySubmission: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchSubmissionsByAssignment = createAsyncThunk(
  'submissions/fetchByAssignment',
  async (assignmentId: string) => {
    const response = await submissionService.getSubmissionsByAssignment(assignmentId);
    return response.data;
  }
);

export const fetchMySubmission = createAsyncThunk(
  'submissions/fetchMySubmission',
  async (assignmentId: string) => {
    const response = await submissionService.getMySubmission(assignmentId);
    return response.data;
  }
);

export const fetchSubmissionById = createAsyncThunk(
  'submissions/fetchSubmissionById',
  async (submissionId: string) => {
    const response = await submissionService.getSubmissionById(submissionId);
    return response.data;
  }
);

export const submitAssignment = createAsyncThunk(
  'submissions/submitAssignment',
  async ({ assignmentId, data }: { assignmentId: string; data: CreateSubmissionDTO }) => {
    const response = await submissionService.submitAssignment(assignmentId, data);
    return response.data;
  }
);

export const gradeSubmission = createAsyncThunk(
  'submissions/gradeSubmission',
  async ({ submissionId, data }: { submissionId: string; data: GradeSubmissionDTO }) => {
    const response = await submissionService.gradeSubmission(submissionId, data);
    return response.data;
  }
);

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    clearCurrentSubmission: (state) => {
      state.currentSubmission = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch submissions by assignment
    builder.addCase(fetchSubmissionsByAssignment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSubmissionsByAssignment.fulfilled, (state, action) => {
      state.loading = false;
      state.submissions = action.payload;
    });
    builder.addCase(fetchSubmissionsByAssignment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch submissions';
    });

    // Fetch my submission
    builder.addCase(fetchMySubmission.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMySubmission.fulfilled, (state, action) => {
      state.loading = false;
      state.mySubmission = action.payload;
    });
    builder.addCase(fetchMySubmission.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch submission';
    });

    // Fetch submission by ID
    builder.addCase(fetchSubmissionById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSubmissionById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSubmission = action.payload;
    });
    builder.addCase(fetchSubmissionById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch submission';
    });

    // Submit assignment
    builder.addCase(submitAssignment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(submitAssignment.fulfilled, (state, action) => {
      state.loading = false;
      state.mySubmission = action.payload;
    });
    builder.addCase(submitAssignment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to submit assignment';
    });

    // Grade submission
    builder.addCase(gradeSubmission.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(gradeSubmission.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.submissions.findIndex((s) => s.submission_id === action.payload.submission_id);
      if (index !== -1) {
        state.submissions[index] = action.payload;
      }
      if (state.currentSubmission?.submission_id === action.payload.submission_id) {
        state.currentSubmission = action.payload;
      }
    });
    builder.addCase(gradeSubmission.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to grade submission';
    });
  },
});

export const { clearCurrentSubmission, clearError } = submissionsSlice.actions;
export default submissionsSlice.reducer;
