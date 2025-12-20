/**
 * File: newHomeworkSlice.ts
 * Mục đích: Redux slice cho Homework state management
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Homework,
  HomeworkDetail,
  StudentHomework,
  Student,
  CreateHomeworkData,
  AssignHomeworkData,
  SubmitHomeworkData,
  GradeSubmissionData,
  getTutorHomeworks,
  getHomeworkDetail,
  createHomework,
  updateHomework,
  deleteHomework,
  assignHomework,
  unassignHomework,
  gradeSubmission,
  getTutorStudentsForHomework,
  getStudentHomeworks,
  getStudentHomeworkDetail,
  submitHomework,
} from '../../services/newHomeworkService';

interface NewHomeworkState {
  // Tutor state
  homeworks: Homework[];
  currentHomework: HomeworkDetail | null;
  students: Student[];

  // Student state
  studentHomeworks: StudentHomework[];
  currentAssignment: StudentHomework | null;

  // UI state
  loading: boolean;
  error: string | null;
  showCreateModal: boolean;
  showAssignModal: boolean;
  showGradeModal: boolean;
  showSubmitModal: boolean;
}

const initialState: NewHomeworkState = {
  homeworks: [],
  currentHomework: null,
  students: [],
  studentHomeworks: [],
  currentAssignment: null,
  loading: false,
  error: null,
  showCreateModal: false,
  showAssignModal: false,
  showGradeModal: false,
  showSubmitModal: false,
};

// ============================================================
// ASYNC THUNKS - TUTOR
// ============================================================

export const fetchTutorHomeworks = createAsyncThunk(
  'newHomework/fetchTutorHomeworks',
  async (_, { rejectWithValue }) => {
    try {
      return await getTutorHomeworks();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách bài tập');
    }
  }
);

export const fetchHomeworkDetail = createAsyncThunk(
  'newHomework/fetchHomeworkDetail',
  async (homeworkId: string, { rejectWithValue }) => {
    try {
      return await getHomeworkDetail(homeworkId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải chi tiết bài tập');
    }
  }
);

export const createHomeworkAsync = createAsyncThunk(
  'newHomework/createHomework',
  async (data: CreateHomeworkData, { rejectWithValue }) => {
    try {
      return await createHomework(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo bài tập');
    }
  }
);

export const updateHomeworkAsync = createAsyncThunk(
  'newHomework/updateHomework',
  async ({ homeworkId, data }: { homeworkId: string; data: Partial<CreateHomeworkData> }, { rejectWithValue }) => {
    try {
      return await updateHomework(homeworkId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật bài tập');
    }
  }
);

export const deleteHomeworkAsync = createAsyncThunk(
  'newHomework/deleteHomework',
  async (homeworkId: string, { rejectWithValue }) => {
    try {
      await deleteHomework(homeworkId);
      return homeworkId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa bài tập');
    }
  }
);

export const assignHomeworkAsync = createAsyncThunk(
  'newHomework/assignHomework',
  async ({ homeworkId, data }: { homeworkId: string; data: AssignHomeworkData }, { rejectWithValue }) => {
    try {
      return await assignHomework(homeworkId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể giao bài tập');
    }
  }
);

export const unassignHomeworkAsync = createAsyncThunk(
  'newHomework/unassignHomework',
  async ({ homeworkId, studentId }: { homeworkId: string; studentId: string }, { rejectWithValue }) => {
    try {
      await unassignHomework(homeworkId, studentId);
      return { homeworkId, studentId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể hủy giao bài tập');
    }
  }
);

export const gradeSubmissionAsync = createAsyncThunk(
  'newHomework/gradeSubmission',
  async ({ submissionId, data }: { submissionId: string; data: GradeSubmissionData }, { rejectWithValue }) => {
    try {
      return await gradeSubmission(submissionId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể chấm điểm');
    }
  }
);

export const fetchTutorStudents = createAsyncThunk(
  'newHomework/fetchTutorStudents',
  async (_, { rejectWithValue }) => {
    try {
      return await getTutorStudentsForHomework();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách học viên');
    }
  }
);

// ============================================================
// ASYNC THUNKS - STUDENT
// ============================================================

export const fetchStudentHomeworks = createAsyncThunk(
  'newHomework/fetchStudentHomeworks',
  async (_, { rejectWithValue }) => {
    try {
      return await getStudentHomeworks();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách bài tập');
    }
  }
);

export const fetchStudentHomeworkDetail = createAsyncThunk(
  'newHomework/fetchStudentHomeworkDetail',
  async (assignmentId: string, { rejectWithValue }) => {
    try {
      return await getStudentHomeworkDetail(assignmentId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải chi tiết bài tập');
    }
  }
);

export const submitHomeworkAsync = createAsyncThunk(
  'newHomework/submitHomework',
  async ({ assignmentId, data }: { assignmentId: string; data: SubmitHomeworkData }, { rejectWithValue }) => {
    try {
      return await submitHomework(assignmentId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể nộp bài tập');
    }
  }
);

// ============================================================
// SLICE
// ============================================================

const newHomeworkSlice = createSlice({
  name: 'newHomework',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setShowCreateModal: (state, action: PayloadAction<boolean>) => {
      state.showCreateModal = action.payload;
    },
    setShowAssignModal: (state, action: PayloadAction<boolean>) => {
      state.showAssignModal = action.payload;
    },
    setShowGradeModal: (state, action: PayloadAction<boolean>) => {
      state.showGradeModal = action.payload;
    },
    setShowSubmitModal: (state, action: PayloadAction<boolean>) => {
      state.showSubmitModal = action.payload;
    },
    clearCurrentHomework: (state) => {
      state.currentHomework = null;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tutor Homeworks
      .addCase(fetchTutorHomeworks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTutorHomeworks.fulfilled, (state, action) => {
        state.loading = false;
        state.homeworks = action.payload;
      })
      .addCase(fetchTutorHomeworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Homework Detail
      .addCase(fetchHomeworkDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeworkDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHomework = action.payload;
      })
      .addCase(fetchHomeworkDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Homework
      .addCase(createHomeworkAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHomeworkAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.homeworks.unshift(action.payload);
        state.showCreateModal = false;
      })
      .addCase(createHomeworkAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Homework
      .addCase(updateHomeworkAsync.fulfilled, (state, action) => {
        const index = state.homeworks.findIndex(h => h.homework_id === action.payload.homework_id);
        if (index !== -1) {
          state.homeworks[index] = action.payload;
        }
        if (state.currentHomework?.homework_id === action.payload.homework_id) {
          state.currentHomework = { ...state.currentHomework, ...action.payload };
        }
      })

      // Delete Homework
      .addCase(deleteHomeworkAsync.fulfilled, (state, action) => {
        state.homeworks = state.homeworks.filter(h => h.homework_id !== action.payload);
      })

      // Assign Homework
      .addCase(assignHomeworkAsync.fulfilled, (state, action) => {
        if (state.currentHomework) {
          // Update assignment in currentHomework
          const existingIndex = state.currentHomework.assignments.findIndex(
            a => a.student_id === action.payload.student_id
          );
          if (existingIndex !== -1) {
            state.currentHomework.assignments[existingIndex] = action.payload;
          } else {
            state.currentHomework.assignments.push(action.payload);
          }
        }
        state.showAssignModal = false;
      })

      // Unassign Homework
      .addCase(unassignHomeworkAsync.fulfilled, (state, action) => {
        if (state.currentHomework) {
          state.currentHomework.assignments = state.currentHomework.assignments.filter(
            a => a.student_id !== action.payload.studentId
          );
        }
      })

      // Grade Submission
      .addCase(gradeSubmissionAsync.fulfilled, (state, action) => {
        if (state.currentHomework) {
          const assignment = state.currentHomework.assignments.find(
            a => a.submission_id === action.payload.submission_id
          );
          if (assignment) {
            assignment.score = action.payload.score;
            assignment.feedback = action.payload.feedback;
            assignment.graded_at = action.payload.graded_at;
            assignment.submission_status = 'GRADED';
            assignment.overall_status = 'GRADED';
          }
        }
        state.showGradeModal = false;
      })

      // Fetch Tutor Students
      .addCase(fetchTutorStudents.fulfilled, (state, action) => {
        state.students = action.payload;
      })

      // Fetch Student Homeworks
      .addCase(fetchStudentHomeworks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentHomeworks.fulfilled, (state, action) => {
        state.loading = false;
        state.studentHomeworks = action.payload;
      })
      .addCase(fetchStudentHomeworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Student Homework Detail
      .addCase(fetchStudentHomeworkDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentHomeworkDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload;
      })
      .addCase(fetchStudentHomeworkDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Submit Homework
      .addCase(submitHomeworkAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitHomeworkAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update local state
        const hw = state.studentHomeworks.find(h => h.assignment_id === action.payload.assignment_id);
        if (hw) {
          hw.submission_id = action.payload.submission_id;
          hw.submitted_at = action.payload.submitted_at;
          hw.overall_status = 'SUBMITTED';
        }
        if (state.currentAssignment && state.currentAssignment.assignment_id === action.payload.assignment_id) {
          state.currentAssignment.submission_id = action.payload.submission_id;
          state.currentAssignment.submitted_at = action.payload.submitted_at;
          state.currentAssignment.overall_status = 'SUBMITTED';
        }
        state.showSubmitModal = false;
      })
      .addCase(submitHomeworkAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setShowCreateModal,
  setShowAssignModal,
  setShowGradeModal,
  setShowSubmitModal,
  clearCurrentHomework,
  clearCurrentAssignment,
} = newHomeworkSlice.actions;

export default newHomeworkSlice.reducer;
