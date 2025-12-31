/**
 * File: controllers/evaluationController.ts
 * Purpose: Handle HTTP requests for evaluation management
 * Updated for new schema with class_id, attendance_id, evaluated_by
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest, ApiResponse } from '../types';
import * as evaluationService from '../services/evaluationService';

export const createEvaluation = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }
    
    const evaluation = await evaluationService.createEvaluation(req.body);
    return res.status(201).json({ success: true, message: 'Evaluation created', data: evaluation } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create evaluation', error: error.message } as ApiResponse);
  }
};

export const getEvaluation = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const evaluationId = req.params.evaluationId; // UUID string
    const evaluation = await evaluationService.getEvaluationById(evaluationId);
    
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' } as ApiResponse);
    }
    
    return res.status(200).json({ success: true, message: 'Evaluation retrieved', data: evaluation } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get evaluation', error: error.message } as ApiResponse);
  }
};

export const getEvaluationsByClass = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const classId = req.params.classId; // UUID string
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const result = await evaluationService.getEvaluationsByClass(classId, month, year, page, limit);
    return res.status(200).json({ success: true, message: 'Evaluations retrieved', data: result } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get evaluations', error: error.message } as ApiResponse);
  }
};

export const getEvaluationsBySchedule = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const scheduleId = req.params.scheduleId; // UUID string
    const evaluations = await evaluationService.getEvaluationsBySchedule(scheduleId);
    
    return res.status(200).json({ success: true, message: 'Evaluations retrieved', data: evaluations } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get evaluations', error: error.message } as ApiResponse);
  }
};

export const getEvaluationStatistics = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const classId = req.params.classId; // UUID string
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    
    const statistics = await evaluationService.getEvaluationStatistics(classId, month, year);
    return res.status(200).json({ success: true, message: 'Evaluation statistics retrieved', data: statistics } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get statistics', error: error.message } as ApiResponse);
  }
};
