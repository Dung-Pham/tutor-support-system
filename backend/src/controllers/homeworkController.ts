/**
 * File: controllers/homeworkController.ts
 * Purpose: Handle HTTP requests for homework & materials management
 * Updated to use new services with UUID
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest, ApiResponse } from '../types';
import * as homeworkService from '../services/homeworkService';

// ============================================================
// MATERIAL CONTROLLERS
// ============================================================

export const uploadMaterial = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }

    const material = await homeworkService.createMaterial({
      ...req.body,
      uploaded_by: req.user!.userId,
    });

    return res.status(201).json({ success: true, message: 'Material uploaded', data: material } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to upload material', error: error.message } as ApiResponse);
  }
};

export const getMaterials = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const filters = {
      class_id: req.query.classId as string | undefined,
      tutor_id: req.query.tutorId as string | undefined,
      schedule_id: req.query.scheduleId as string | undefined,
    };

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await homeworkService.getMaterials(filters, page, limit);

    return res.status(200).json({ success: true, message: 'Materials retrieved', data: result } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get materials', error: error.message } as ApiResponse);
  }
};

export const getMaterialById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const materialId = req.params.materialId; // UUID
    const material = await homeworkService.getMaterialById(materialId);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' } as ApiResponse);
    }

    return res.status(200).json({ success: true, message: 'Material retrieved', data: material } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get material', error: error.message } as ApiResponse);
  }
};

export const deleteMaterial = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const materialId = req.params.materialId; // UUID
    await homeworkService.deleteMaterial(materialId);

    return res.status(200).json({ success: true, message: 'Material deleted' } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete material', error: error.message } as ApiResponse);
  }
};

// ============================================================
// HOMEWORK CONTROLLERS
// ============================================================

export const createHomework = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }

    const homework = await homeworkService.createHomework({
      ...req.body,
      assigned_by: req.user!.userId,
    });

    return res.status(201).json({ success: true, message: 'Homework created', data: homework } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create homework', error: error.message } as ApiResponse);
  }
};

export const getHomeworkById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const homeworkId = req.params.homeworkId; // UUID
    const homework = await homeworkService.getHomeworkById(homeworkId);

    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' } as ApiResponse);
    }

    return res.status(200).json({ success: true, message: 'Homework retrieved', data: homework } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get homework', error: error.message } as ApiResponse);
  }
};

export const getHomeworkList = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const filters = {
      class_id: req.query.classId as string | undefined,
      schedule_id: req.query.scheduleId as string | undefined,
      student_id: req.query.studentId as string | undefined,
      status: req.query.status as string | undefined,
      assigned_by: req.query.assignedBy as string | undefined,
    };

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await homeworkService.getHomework(filters, page, limit);

    return res.status(200).json({ success: true, message: 'Homework retrieved', data: result } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get homework', error: error.message } as ApiResponse);
  }
};

export const updateHomework = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }

    const homeworkId = req.params.homeworkId; // UUID
    const homework = await homeworkService.updateHomework(homeworkId, req.body);

    return res.status(200).json({ success: true, message: 'Homework updated', data: homework } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update homework', error: error.message } as ApiResponse);
  }
};

export const deleteHomework = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const homeworkId = req.params.homeworkId; // UUID
    await homeworkService.deleteHomework(homeworkId);

    return res.status(200).json({ success: true, message: 'Homework deleted' } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete homework', error: error.message } as ApiResponse);
  }
};

// ============================================================
// SUBMISSION CONTROLLERS
// ============================================================

export const submitHomework = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }

    const submission = await homeworkService.submitHomework({
      homework_id: req.body.homework_id || req.params.homeworkId,
      student_id: req.user!.userId,
      file_name: req.body.file_name,
      file_url: req.body.file_url,
      file_size: req.body.file_size,
    });

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

    const submissionId = req.params.submissionId; // UUID

    const submission = await homeworkService.gradeSubmission(submissionId, {
      score: req.body.score,
      max_score: req.body.max_score,
      feedback: req.body.feedback,
      graded_by: req.user!.userId,
    });

    return res.status(200).json({ success: true, message: 'Homework graded', data: submission } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to grade homework', error: error.message } as ApiResponse);
  }
};

export const getSubmissionsByHomework = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const homeworkId = req.params.homeworkId; // UUID
    const submissions = await homeworkService.getSubmissionsByHomework(homeworkId);

    return res.status(200).json({ success: true, message: 'Submissions retrieved', data: submissions } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get submissions', error: error.message } as ApiResponse);
  }
};

export const getSubmissionById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const submissionId = req.params.submissionId; // UUID
    const submission = await homeworkService.getSubmissionById(submissionId);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' } as ApiResponse);
    }

    return res.status(200).json({ success: true, message: 'Submission retrieved', data: submission } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get submission', error: error.message } as ApiResponse);
  }
};

export const getStudentSubmission = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const homeworkId = req.params.homeworkId; // UUID
    const studentId = req.params.studentId || req.user!.userId; // UUID

    const submission = await homeworkService.getStudentSubmission(homeworkId, studentId);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' } as ApiResponse);
    }

    return res.status(200).json({ success: true, message: 'Submission retrieved', data: submission } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get submission', error: error.message } as ApiResponse);
  }
};

export const deleteSubmission = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const submissionId = req.params.submissionId; // UUID
    await homeworkService.deleteSubmission(submissionId);

    return res.status(200).json({ success: true, message: 'Submission deleted' } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete submission', error: error.message } as ApiResponse);
  }
};

export const getHomeworkStatistics = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const classId = req.params.classId; // UUID
    const stats = await homeworkService.getHomeworkStatistics(classId);

    return res.status(200).json({ success: true, message: 'Statistics retrieved', data: stats } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get statistics', error: error.message } as ApiResponse);
  }
};
