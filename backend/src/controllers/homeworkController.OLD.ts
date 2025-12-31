/**
 * File: controllers/homeworkController.ts
 * Mục đích: Handle HTTP requests cho homework & materials management
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest, ApiResponse } from '../types';
import * as homeworkService from '../services/homeworkService';

// Materials
export const uploadMaterial = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }
    const material = await homeworkService.uploadMaterial(req.body, req.user!.userId);
    return res.status(201).json({ success: true, message: 'Material uploaded', data: material } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to upload material', error: error.message } as ApiResponse);
  }
};

export const getMaterialsBySubject = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const subjectId = parseInt(req.params.subjectId);
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await homeworkService.getMaterialsBySubject(subjectId, page, limit);
    return res.status(200).json({ success: true, message: 'Materials retrieved', data: result } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get materials', error: error.message } as ApiResponse);
  }
};

// Homework
export const createHomework = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }
    const homework = await homeworkService.createHomework(req.body, req.user!.userId);
    return res.status(201).json({ success: true, message: 'Homework created', data: homework } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create homework', error: error.message } as ApiResponse);
  }
};

export const getHomework = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const homeworkId = parseInt(req.params.homeworkId);
    const homework = await homeworkService.getHomeworkById(homeworkId);
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' } as ApiResponse);
    }
    return res.status(200).json({ success: true, message: 'Homework retrieved', data: homework } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get homework', error: error.message } as ApiResponse);
  }
};

export const getHomeworkForStudent = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const studentId = parseInt(req.params.studentId);
    const status = req.query.status as any;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await homeworkService.getHomeworkForStudent(studentId, status, page, limit);
    return res.status(200).json({ success: true, message: 'Homework retrieved', data: result } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get homework', error: error.message } as ApiResponse);
  }
};

// Submissions
export const submitHomework = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }
    const homeworkId = parseInt(req.params.homeworkId);
    const submission = await homeworkService.submitHomework(homeworkId, req.user!.userId, req.body);
    return res.status(201).json({ success: true, message: 'Homework submitted', data: submission } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to submit homework', error: error.message } as ApiResponse);
  }
};

export const gradeSubmission = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }
    const submissionId = parseInt(req.params.submissionId);
    const submission = await homeworkService.gradeSubmission(submissionId, req.body);
    return res.status(200).json({ success: true, message: 'Homework graded', data: submission } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to grade homework', error: error.message } as ApiResponse);
  }
};

export const getSubmissionsByHomework = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const homeworkId = parseInt(req.params.homeworkId);
    const submissions = await homeworkService.getSubmissionsByHomework(homeworkId);
    return res.status(200).json({ success: true, message: 'Submissions retrieved', data: submissions } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get submissions', error: error.message } as ApiResponse);
  }
};
