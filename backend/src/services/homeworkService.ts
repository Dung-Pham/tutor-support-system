/**
 * File: services/homeworkService.ts
 * Purpose: Business logic for materials and homework management
 * Updated to use new query modules with UUID and correct schema
 */

import * as homeworkQueries from '../database/queries/homeworkQueries';
import {
  Material,
  Homework,
  HomeworkSubmission,
  CreateMaterialDTO,
  CreateHomeworkDTO,
  UpdateHomeworkDTO,
  SubmitHomeworkDTO,
  GradeHomeworkDTO
} from '../database/queries/homeworkQueries';

// ============================================================
// MATERIAL SERVICES
// ============================================================

/**
 * Upload/Create material
 */
export const createMaterial = async (data: CreateMaterialDTO): Promise<Material> => {
  return await homeworkQueries.createMaterial(data);
};

/**
 * Get materials
 */
export const getMaterials = async (
  filters: {
    class_id?: string;
    tutor_id?: string;
    schedule_id?: string;
  },
  page: number = 1,
  limit: number = 20
): Promise<{
  materials: Material[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const offset = (page - 1) * limit;

  const result = await homeworkQueries.getMaterials({
    ...filters,
    limit,
    offset,
  });

  return {
    materials: result.materials,
    total: result.total,
    page,
    totalPages: Math.ceil(result.total / limit),
  };
};

/**
 * Get material by ID
 */
export const getMaterialById = async (materialId: string): Promise<Material | null> => {
  return await homeworkQueries.getMaterialById(materialId);
};

/**
 * Delete material
 */
export const deleteMaterial = async (materialId: string): Promise<boolean> => {
  const material = await homeworkQueries.getMaterialById(materialId);

  if (!material) {
    throw new Error('Material not found');
  }

  return await homeworkQueries.deleteMaterial(materialId);
};

// ============================================================
// HOMEWORK SERVICES
// ============================================================

/**
 * Create homework
 */
export const createHomework = async (data: CreateHomeworkDTO): Promise<Homework> => {
  // Validate due date is in the future if provided (compare dates only, not time)
  if (data.due_date) {
    const dueDate = new Date(data.due_date);
    const today = new Date();
    // Reset time to start of day for comparison
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      throw new Error('Due date must be today or in the future');
    }
  }

  return await homeworkQueries.createHomework(data);
};

/**
 * Get homework by ID
 */
export const getHomeworkById = async (homeworkId: string): Promise<Homework | null> => {
  return await homeworkQueries.getHomeworkById(homeworkId);
};

/**
 * Get homework detail with assignments (for tutor detail page)
 */
export const getHomeworkDetailWithAssignments = async (homeworkId: string): Promise<any | null> => {
  return await homeworkQueries.getHomeworkDetailWithAssignments(homeworkId);
};

/**
 * Get homework list
 */
export const getHomework = async (
  filters: {
    class_id?: string;
    schedule_id?: string;
    student_id?: string;
    status?: string;
    assigned_by?: string;
    due_after?: Date;
    due_before?: Date;
  },
  page: number = 1,
  limit: number = 20
): Promise<{
  homework: Homework[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const offset = (page - 1) * limit;

  const result = await homeworkQueries.getHomework({
    ...filters,
    limit,
    offset,
  });

  return {
    homework: result.homework,
    total: result.total,
    page,
    totalPages: Math.ceil(result.total / limit),
  };
};

/**
 * Update homework
 */
export const updateHomework = async (
  homeworkId: string,
  data: UpdateHomeworkDTO
): Promise<Homework> => {
  const homework = await homeworkQueries.getHomeworkById(homeworkId);

  if (!homework) {
    throw new Error('Homework not found');
  }

  // Validate due date if updating
  if (data.due_date) {
    const dueDate = new Date(data.due_date);
    if (dueDate < new Date()) {
      throw new Error('Due date must be in the future');
    }
  }

  return await homeworkQueries.updateHomework(homeworkId, data);
};

/**
 * Delete homework
 */
export const deleteHomework = async (homeworkId: string): Promise<boolean> => {
  const homework = await homeworkQueries.getHomeworkById(homeworkId);

  if (!homework) {
    throw new Error('Homework not found');
  }

  return await homeworkQueries.deleteHomework(homeworkId);
};

// ============================================================
// HOMEWORK SUBMISSION SERVICES
// ============================================================

/**
 * Submit homework
 */
export const submitHomework = async (data: SubmitHomeworkDTO): Promise<HomeworkSubmission> => {
  // If assignment_id is provided, get homework_id from assignment
  if (data.assignment_id && !data.homework_id) {
    const assignment = await homeworkQueries.getAssignmentById(data.assignment_id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    data.homework_id = assignment.homework_id;
  }

  // Check if homework exists
  if (data.homework_id) {
    const homework = await homeworkQueries.getHomeworkById(data.homework_id);

    if (!homework) {
      throw new Error('Homework not found');
    }

    if (homework.status && homework.status !== 'ACTIVE') {
      throw new Error('Homework is not active');
    }
  }

  return await homeworkQueries.submitHomework(data);
};

/**
 * Grade submission
 */
export const gradeSubmission = async (
  submissionId: string,
  grading: GradeHomeworkDTO
): Promise<HomeworkSubmission> => {
  // Check if submission exists
  const submission = await homeworkQueries.getSubmissionById(submissionId);

  if (!submission) {
    throw new Error('Submission not found');
  }

  // Validate score
  const maxScore = grading.max_score || 100;
  if (grading.score < 0 || grading.score > maxScore) {
    throw new Error(`Score must be between 0 and ${maxScore}`);
  }

  return await homeworkQueries.gradeSubmission(submissionId, grading);
};

/**
 * Get submissions by homework
 */
export const getSubmissionsByHomework = async (
  homeworkId: string
): Promise<HomeworkSubmission[]> => {
  const homework = await homeworkQueries.getHomeworkById(homeworkId);

  if (!homework) {
    throw new Error('Homework not found');
  }

  return await homeworkQueries.getSubmissionsByHomework(homeworkId);
};

/**
 * Get submission by ID
 */
export const getSubmissionById = async (
  submissionId: string
): Promise<HomeworkSubmission | null> => {
  return await homeworkQueries.getSubmissionById(submissionId);
};

/**
 * Get student's submission for specific homework
 */
export const getStudentSubmission = async (
  homeworkId: string,
  studentId: string
): Promise<HomeworkSubmission | null> => {
  return await homeworkQueries.getStudentSubmission(homeworkId, studentId);
};

/**
 * Delete submission
 */
export const deleteSubmission = async (submissionId: string): Promise<boolean> => {
  const submission = await homeworkQueries.getSubmissionById(submissionId);

  if (!submission) {
    throw new Error('Submission not found');
  }

  return await homeworkQueries.deleteSubmission(submissionId);
};

/**
 * Get homework statistics for a class
 */
export const getHomeworkStatistics = async (
  classId: string
): Promise<{
  total_homework: number;
  active_homework: number;
  total_submissions: number;
  avg_score: number;
  completion_rate: number;
}> => {
  return await homeworkQueries.getHomeworkStatistics(classId);
};

/**
 * Assign homework to student
 */
export const assignHomeworkToStudent = async (data: {
  homework_id: string;
  student_id: string;
  assigned_by: string;
  due_date?: string;
  note?: string;
}): Promise<any> => {
  return await homeworkQueries.assignHomeworkToStudent(data);
};

/**
 * Get student assignments
 */
export const getStudentAssignments = async (studentId: string): Promise<any[]> => {
  return await homeworkQueries.getStudentAssignments(studentId);
};

/**
 * Get assignment by ID
 */
export const getAssignmentById = async (assignmentId: string): Promise<any | null> => {
  return await homeworkQueries.getAssignmentById(assignmentId);
};

/**
 * Delete assignment
 */
export const deleteAssignment = async (homeworkId: string, studentId: string): Promise<boolean> => {
  return await homeworkQueries.deleteAssignment(homeworkId, studentId);
};

/**
 * Get tutor's students
 */
export const getTutorStudents = async (tutorId: string): Promise<any[]> => {
  return await homeworkQueries.getTutorStudents(tutorId);
};
