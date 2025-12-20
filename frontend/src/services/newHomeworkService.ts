/**
 * File: newHomeworkService.ts
 * Mục đích: API service cho Homework operations
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// TYPES
// ============================================================

export interface Homework {
  homework_id: string;
  tutor_id: string;
  class_id: string | null;
  title: string;
  description: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  max_score: number;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  class_name?: string;
  assigned_count?: number;
  submitted_count?: number;
}

export interface HomeworkAssignment {
  assignment_id: string;
  homework_id: string;
  student_id: string;
  due_date: string;
  note: string | null;
  assignment_status: string;
  assigned_at: string;
  student_name: string;
  student_email: string;
  submission_id?: string;
  submission_content?: string;
  submission_attachment_url?: string;
  submission_attachment_name?: string;
  submitted_at?: string;
  is_late?: boolean;
  score?: number;
  feedback?: string;
  graded_at?: string;
  submission_status?: string;
  overall_status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
}

export interface HomeworkDetail extends Homework {
  assignments: HomeworkAssignment[];
}

export interface StudentHomework {
  assignment_id: string;
  homework_id: string;
  due_date: string;
  note: string | null;
  assignment_status: string;
  assigned_at: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  max_score: number;
  tutor_name: string;
  submission_id?: string;
  submitted_at?: string;
  score?: number;
  feedback?: string;
  submission_status?: string;
  overall_status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
  // Additional fields for detail view
  is_late?: boolean;
  submission_content?: string;
  submission_attachment_url?: string;
  submission_attachment_name?: string;
  submission_attachment_type?: string;
}

export interface Student {
  user_id: string;
  name: string;
  email: string;
  class_id: string;
  class_name: string;
}

export interface CreateHomeworkData {
  title: string;
  description?: string;
  classId?: string;
  maxScore?: number;
  dueDate?: string;
  attachment?: File;
  attachmentUrl?: string; // External link to resource
}

export interface AssignHomeworkData {
  studentId: string;
  dueDate: string;
  note?: string;
}

export interface SubmitHomeworkData {
  content?: string;
  file?: File;
}

export interface GradeSubmissionData {
  score: number;
  feedback?: string;
}

// ============================================================
// TUTOR SERVICES
// ============================================================

/**
 * Lấy danh sách bài tập của gia sư
 */
export const getTutorHomeworks = async (): Promise<Homework[]> => {
  const response = await apiClient.get('/new-homework/tutor');
  return response.data.data;
};

/**
 * Lấy chi tiết bài tập (kèm danh sách học viên)
 */
export const getHomeworkDetail = async (homeworkId: string): Promise<HomeworkDetail> => {
  const response = await apiClient.get(`/new-homework/tutor/${homeworkId}`);
  return response.data.data;
};

/**
 * Tạo bài tập mới
 */
export const createHomework = async (data: CreateHomeworkData): Promise<Homework> => {
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.classId) formData.append('classId', data.classId);
  if (data.maxScore) formData.append('maxScore', data.maxScore.toString());
  if (data.dueDate) formData.append('dueDate', data.dueDate);
  if (data.attachment) formData.append('attachment', data.attachment);
  if (data.attachmentUrl) formData.append('attachmentUrl', data.attachmentUrl);

  const response = await apiClient.post('/new-homework/tutor', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

/**
 * Cập nhật bài tập
 */
export const updateHomework = async (homeworkId: string, data: Partial<CreateHomeworkData>): Promise<Homework> => {
  const response = await apiClient.put(`/new-homework/tutor/${homeworkId}`, data);
  return response.data.data;
};

/**
 * Xóa bài tập
 */
export const deleteHomework = async (homeworkId: string): Promise<void> => {
  await apiClient.delete(`/new-homework/tutor/${homeworkId}`);
};

/**
 * Giao bài tập cho học viên
 */
export const assignHomework = async (homeworkId: string, data: AssignHomeworkData): Promise<HomeworkAssignment> => {
  const response = await apiClient.post(`/new-homework/tutor/${homeworkId}/assign`, data);
  return response.data.data;
};

/**
 * Hủy giao bài tập
 */
export const unassignHomework = async (homeworkId: string, studentId: string): Promise<void> => {
  await apiClient.delete(`/new-homework/tutor/${homeworkId}/assign/${studentId}`);
};

/**
 * Chấm điểm bài nộp
 */
export const gradeSubmission = async (submissionId: string, data: GradeSubmissionData): Promise<any> => {
  const response = await apiClient.post(`/new-homework/tutor/grade/${submissionId}`, data);
  return response.data.data;
};

/**
 * Lấy danh sách học viên để giao bài
 */
export const getTutorStudentsForHomework = async (): Promise<Student[]> => {
  const response = await apiClient.get('/new-homework/tutor/students');
  return response.data.data;
};

// ============================================================
// STUDENT SERVICES
// ============================================================

/**
 * Lấy danh sách bài tập được giao
 */
export const getStudentHomeworks = async (): Promise<StudentHomework[]> => {
  const response = await apiClient.get('/new-homework/student');
  return response.data.data;
};

/**
 * Lấy chi tiết bài tập được giao
 */
export const getStudentHomeworkDetail = async (assignmentId: string): Promise<StudentHomework> => {
  const response = await apiClient.get(`/new-homework/student/${assignmentId}`);
  return response.data.data;
};

/**
 * Nộp bài tập
 */
export const submitHomework = async (assignmentId: string, data: SubmitHomeworkData): Promise<any> => {
  const formData = new FormData();
  if (data.content) formData.append('content', data.content);
  if (data.file) formData.append('attachment', data.file);

  const response = await apiClient.post(`/new-homework/student/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export default {
  // Tutor
  getTutorHomeworks,
  getHomeworkDetail,
  createHomework,
  updateHomework,
  deleteHomework,
  assignHomework,
  unassignHomework,
  gradeSubmission,
  getTutorStudentsForHomework,

  // Student
  getStudentHomeworks,
  getStudentHomeworkDetail,
  submitHomework,
};
