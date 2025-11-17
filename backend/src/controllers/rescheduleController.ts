/**
 * File: controllers/rescheduleController.ts
 * Mục đích: Handle HTTP requests cho reschedule management
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest, ApiResponse } from '../types';
import * as rescheduleService from '../services/rescheduleService';

export const createReschedule = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }
    
    const reschedule = await rescheduleService.createRescheduleRequest(req.body, req.user!.userId);
    return res.status(201).json({ success: true, message: 'Reschedule request created', data: reschedule } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create reschedule request', error: error.message } as ApiResponse);
  }
};

export const getReschedule = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const rescheduleId = parseInt(req.params.rescheduleId);
    const reschedule = await rescheduleService.getRescheduleById(rescheduleId);
    
    if (!reschedule) {
      return res.status(404).json({ success: false, message: 'Reschedule request not found' } as ApiResponse);
    }
    
    return res.status(200).json({ success: true, message: 'Reschedule request retrieved', data: reschedule } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve reschedule request', error: error.message } as ApiResponse);
  }
};

export const getPendingReschedules = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const reschedules = await rescheduleService.getPendingReschedules(req.user!.userId, req.user!.role);
    return res.status(200).json({ success: true, message: 'Pending reschedules retrieved', data: reschedules } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve reschedules', error: error.message } as ApiResponse);
  }
};

export const reviewReschedule = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }
    
    const rescheduleId = parseInt(req.params.rescheduleId);
    const reschedule = await rescheduleService.reviewRescheduleRequest(rescheduleId, req.body, req.user!.userId);
    
    return res.status(200).json({ success: true, message: 'Reschedule request reviewed', data: reschedule } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to review reschedule', error: error.message } as ApiResponse);
  }
};

export const cancelReschedule = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const rescheduleId = parseInt(req.params.rescheduleId);
    await rescheduleService.cancelRescheduleRequest(rescheduleId, req.user!.userId);
    
    return res.status(200).json({ success: true, message: 'Reschedule request cancelled' } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to cancel reschedule', error: error.message } as ApiResponse);
  }
};
