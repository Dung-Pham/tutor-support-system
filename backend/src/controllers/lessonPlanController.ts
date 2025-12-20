/**
 * File: controllers/lessonPlanController.ts
 * Purpose: Handle HTTP requests for lesson plan management
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest, ApiResponse } from '../types';
import * as lessonPlanService from '../services/lessonPlanService';

/**
 * Create new lesson plan
 * POST /api/lesson-plans
 */
export const createLessonPlan = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: errors.array()
      } as ApiResponse);
    }

    const lessonPlan = await lessonPlanService.createLessonPlan(req.body);

    return res.status(201).json({
      success: true,
      message: 'Lesson plan created successfully',
      data: lessonPlan
    } as ApiResponse);
  } catch (error: any) {
    console.error('[createLessonPlan] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create lesson plan',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get lesson plans by class
 * GET /api/lesson-plans/class/:classId
 */
export const getLessonPlansByClass = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const classId = req.params.classId;
    const lessonPlans = await lessonPlanService.getLessonPlansByClass(classId);

    return res.status(200).json({
      success: true,
      message: 'Lesson plans retrieved successfully',
      data: lessonPlans
    } as ApiResponse);
  } catch (error: any) {
    console.error('[getLessonPlansByClass] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve lesson plans',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get lesson plan by ID
 * GET /api/lesson-plans/:lessonPlanId
 */
export const getLessonPlanById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const lessonPlanId = req.params.lessonPlanId;
    const lessonPlan = await lessonPlanService.getLessonPlanById(lessonPlanId);

    if (!lessonPlan) {
      return res.status(404).json({
        success: false,
        message: 'Lesson plan not found'
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      message: 'Lesson plan retrieved successfully',
      data: lessonPlan
    } as ApiResponse);
  } catch (error: any) {
    console.error('[getLessonPlanById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve lesson plan',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Update lesson plan
 * PUT /api/lesson-plans/:lessonPlanId
 */
export const updateLessonPlan = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const lessonPlanId = req.params.lessonPlanId;
    const lessonPlan = await lessonPlanService.updateLessonPlan(lessonPlanId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Lesson plan updated successfully',
      data: lessonPlan
    } as ApiResponse);
  } catch (error: any) {
    console.error('[updateLessonPlan] Error:', error);
    if (error.message === 'Lesson plan not found') {
      return res.status(404).json({
        success: false,
        message: 'Lesson plan not found'
      } as ApiResponse);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update lesson plan',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Delete lesson plan
 * DELETE /api/lesson-plans/:lessonPlanId
 */
export const deleteLessonPlan = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const lessonPlanId = req.params.lessonPlanId;
    await lessonPlanService.deleteLessonPlan(lessonPlanId);

    return res.status(200).json({
      success: true,
      message: 'Lesson plan deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    console.error('[deleteLessonPlan] Error:', error);
    if (error.message === 'Lesson plan not found') {
      return res.status(404).json({
        success: false,
        message: 'Lesson plan not found'
      } as ApiResponse);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to delete lesson plan',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Bulk create lesson plans
 * POST /api/lesson-plans/bulk/:classId
 */
export const bulkCreateLessonPlans = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const classId = req.params.classId;
    const { plans } = req.body;

    if (!Array.isArray(plans) || plans.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Plans array is required'
      } as ApiResponse);
    }

    const lessonPlans = await lessonPlanService.bulkCreateLessonPlans(classId, plans);

    return res.status(201).json({
      success: true,
      message: 'Lesson plans created successfully',
      data: lessonPlans
    } as ApiResponse);
  } catch (error: any) {
    console.error('[bulkCreateLessonPlans] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create lesson plans',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Mark lesson as completed
 * PUT /api/lesson-plans/:lessonPlanId/complete
 */
export const markLessonCompleted = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const lessonPlanId = req.params.lessonPlanId;
    const lessonPlan = await lessonPlanService.markLessonCompleted(lessonPlanId);

    return res.status(200).json({
      success: true,
      message: 'Lesson marked as completed',
      data: lessonPlan
    } as ApiResponse);
  } catch (error: any) {
    console.error('[markLessonCompleted] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark lesson as completed',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get class statistics
 * GET /api/lesson-plans/stats/:classId
 */
export const getClassStatistics = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const classId = req.params.classId;
    const stats = await lessonPlanService.getClassStatistics(classId);

    return res.status(200).json({
      success: true,
      message: 'Class statistics retrieved successfully',
      data: stats
    } as ApiResponse);
  } catch (error: any) {
    console.error('[getClassStatistics] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve class statistics',
      error: error.message
    } as ApiResponse);
  }
};
