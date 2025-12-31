/**
 * File: services/evaluationService.ts
 * Purpose: Business logic for progress evaluation management
 * Updated to use new schema with attendance_id, class_id, evaluated_by
 */

import * as evaluationQueries from '../database/queries/evaluationQueries';
import {
  ProgressEvaluation,
  CreateEvaluationDTO
} from '../database/queries/evaluationQueries';
import * as attendanceQueries from '../database/queries/attendanceQueries';

/**
 * Create a progress evaluation
 * Requires attendance to be CONFIRMED
 */
export const createEvaluation = async (
  data: CreateEvaluationDTO
): Promise<ProgressEvaluation> => {
  // Verify attendance exists and is confirmed
  const attendance = await attendanceQueries.getAttendanceById(data.attendance_id);
  
  if (!attendance) {
    throw new Error('Attendance record not found');
  }
  
  if (attendance.overall_status !== 'CONFIRMED') {
    throw new Error('Cannot create evaluation: attendance not confirmed by both parties');
  }

  // Create evaluation
  return await evaluationQueries.createEvaluation(data);
};

/**
 * Get evaluation by ID
 */
export const getEvaluationById = async (
  evaluationId: string
): Promise<ProgressEvaluation | null> => {
  return await evaluationQueries.getEvaluationById(evaluationId);
};

/**
 * Get evaluations by schedule
 */
export const getEvaluationsBySchedule = async (
  scheduleId: string
): Promise<ProgressEvaluation[]> => {
  return await evaluationQueries.getEvaluationsBySchedule(scheduleId);
};

/**
 * Get evaluations by class with pagination
 */
export const getEvaluationsByClass = async (
  classId: string,
  month?: number,
  year?: number,
  page: number = 1,
  limit: number = 20
): Promise<{
  evaluations: ProgressEvaluation[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const offset = (page - 1) * limit;

  const result = await evaluationQueries.getEvaluationsByClass(classId, {
    month,
    year,
    limit,
    offset,
  });

  return {
    evaluations: result.evaluations,
    total: result.total,
    page,
    totalPages: Math.ceil(result.total / limit),
  };
};

/**
 * Get evaluation statistics for a class
 */
export const getEvaluationStatistics = async (
  classId: string,
  month?: number,
  year?: number
): Promise<{
  total_evaluations: number;
  average_overall_rating: number;
  average_understanding: number;
  average_participation: number;
  average_homework: number;
  average_behavior: number;
}> => {
  return await evaluationQueries.getEvaluationStatistics(classId, month, year);
};

/**
 * Update evaluation
 */
export const updateEvaluation = async (
  evaluationId: string,
  data: Partial<CreateEvaluationDTO>
): Promise<ProgressEvaluation> => {
  const existing = await evaluationQueries.getEvaluationById(evaluationId);
  
  if (!existing) {
    throw new Error('Evaluation not found');
  }

  return await evaluationQueries.updateEvaluation(evaluationId, data);
};

/**
 * Delete evaluation
 */
export const deleteEvaluation = async (evaluationId: string): Promise<boolean> => {
  const existing = await evaluationQueries.getEvaluationById(evaluationId);
  
  if (!existing) {
    throw new Error('Evaluation not found');
  }

  return await evaluationQueries.deleteEvaluation(evaluationId);
};
