/**
 * File: services/lessonPlanService.ts
 * Purpose: Business logic for lesson plan management
 */

import * as lessonPlanQueries from '../database/queries/lessonPlanQueries';
import {
  LessonPlan,
  CreateLessonPlanDTO,
  UpdateLessonPlanDTO,
} from '../database/queries/lessonPlanQueries';

/**
 * Create a new lesson plan
 */
export const createLessonPlan = async (data: CreateLessonPlanDTO): Promise<LessonPlan> => {
  return await lessonPlanQueries.createLessonPlan(data);
};

/**
 * Get lesson plans by class ID
 */
export const getLessonPlansByClass = async (classId: string): Promise<LessonPlan[]> => {
  return await lessonPlanQueries.getLessonPlansByClass(classId);
};

/**
 * Get lesson plan by ID
 */
export const getLessonPlanById = async (lessonPlanId: string): Promise<LessonPlan | null> => {
  return await lessonPlanQueries.getLessonPlanById(lessonPlanId);
};

/**
 * Update lesson plan
 */
export const updateLessonPlan = async (
  lessonPlanId: string,
  data: UpdateLessonPlanDTO
): Promise<LessonPlan> => {
  const existing = await lessonPlanQueries.getLessonPlanById(lessonPlanId);
  if (!existing) {
    throw new Error('Lesson plan not found');
  }
  return await lessonPlanQueries.updateLessonPlan(lessonPlanId, data);
};

/**
 * Delete lesson plan
 */
export const deleteLessonPlan = async (lessonPlanId: string): Promise<boolean> => {
  const existing = await lessonPlanQueries.getLessonPlanById(lessonPlanId);
  if (!existing) {
    throw new Error('Lesson plan not found');
  }
  return await lessonPlanQueries.deleteLessonPlan(lessonPlanId);
};

/**
 * Bulk create lesson plans for a class
 */
export const bulkCreateLessonPlans = async (
  classId: string,
  plans: Array<{
    lesson_number: number;
    session_date: Date | string;
    topic: string;
    description?: string;
  }>
): Promise<LessonPlan[]> => {
  return await lessonPlanQueries.bulkCreateLessonPlans(classId, plans);
};

/**
 * Mark lesson as completed
 */
export const markLessonCompleted = async (lessonPlanId: string): Promise<LessonPlan> => {
  return await lessonPlanQueries.updateLessonPlan(lessonPlanId, { status: 'completed' });
};

/**
 * Get class statistics
 */
export const getClassStatistics = async (classId: string) => {
  return await lessonPlanQueries.getClassStatistics(classId);
};
