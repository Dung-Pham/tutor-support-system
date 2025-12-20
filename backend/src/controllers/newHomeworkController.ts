/**
 * File: controllers/newHomeworkController.ts
 * Mục đích: Xử lý HTTP requests cho Homework Management System (Module VI)
 * Features:
 *   - Tutor: CRUD bài tập
 *   - Tutor: Giao bài tập cho học viên
 *   - Tutor: Chấm điểm bài nộp
 *   - Student: Xem bài tập được giao
 *   - Student: Nộp bài tập
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import * as homeworkQueries from '../database/queries/homeworkQueries';

// ============================================================
// TUTOR - Lấy danh sách bài tập
// ============================================================

export const getTutorHomeworks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    if (!tutorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const homeworks = await homeworkQueries.getTutorHomeworksNew(tutorId);
    
    return res.status(200).json({
      success: true,
      message: 'Tutor homeworks retrieved',
      data: homeworks,
    });
  } catch (error: any) {
    console.error('Error getting tutor homeworks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tutor homeworks',
      error: error.message,
    });
  }
};

// ============================================================
// TUTOR - Lấy chi tiết bài tập
// ============================================================

export const getHomeworkDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const { homeworkId } = req.params;
    
    if (!tutorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const homework = await homeworkQueries.getHomeworkDetailNew(homeworkId, tutorId);
    
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Homework detail retrieved',
      data: homework,
    });
  } catch (error: any) {
    console.error('Error getting homework detail:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get homework detail',
      error: error.message,
    });
  }
};

// ============================================================
// TUTOR - Tạo bài tập mới
// ============================================================

export const createHomework = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    if (!tutorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { title, description, classId, maxScore, attachmentUrl, attachmentName, attachmentType } = req.body;
    
    const homework = await homeworkQueries.createHomeworkNew({
      tutorId,
      classId,
      title,
      description,
      attachmentUrl,
      attachmentName,
      attachmentType,
      maxScore: maxScore ? parseFloat(maxScore) : 10
    });
    
    return res.status(201).json({
      success: true,
      message: 'Homework created',
      data: homework,
    });
  } catch (error: any) {
    console.error('Error creating homework:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create homework',
      error: error.message,
    });
  }
};

// ============================================================
// TUTOR - Sửa bài tập
// ============================================================

export const updateHomework = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const { homeworkId } = req.params;
    
    if (!tutorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const homework = await homeworkQueries.updateHomeworkNew(homeworkId, tutorId, req.body);
    
    return res.status(200).json({
      success: true,
      message: 'Homework updated',
      data: homework,
    });
  } catch (error: any) {
    console.error('Error updating homework:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update homework',
      error: error.message,
    });
  }
};

// ============================================================
// TUTOR - Xóa bài tập
// ============================================================

export const deleteHomework = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const { homeworkId } = req.params;
    
    if (!tutorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    await homeworkQueries.deleteHomeworkNew(homeworkId, tutorId);
    
    return res.status(200).json({
      success: true,
      message: 'Homework deleted',
    });
  } catch (error: any) {
    console.error('Error deleting homework:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete homework',
      error: error.message,
    });
  }
};

// ============================================================
// TUTOR - Lấy danh sách học viên
// ============================================================

export const getTutorStudents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    if (!tutorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const students = await homeworkQueries.getTutorStudentsNew(tutorId);
    
    return res.status(200).json({
      success: true,
      message: 'Tutor students retrieved',
      data: students,
    });
  } catch (error: any) {
    console.error('Error getting tutor students:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tutor students',
      error: error.message,
    });
  }
};

// ============================================================
// ASSIGNMENT - Giao bài tập
// ============================================================

export const assignHomework = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const { homeworkId } = req.params;
    const { studentId, dueDate, note } = req.body;
    
    if (!tutorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const assignment = await homeworkQueries.assignHomeworkNew({
      homeworkId,
      studentId,
      assignedBy: tutorId,
      dueDate,
      note
    });
    
    return res.status(201).json({
      success: true,
      message: 'Homework assigned',
      data: assignment,
    });
  } catch (error: any) {
    console.error('Error assigning homework:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign homework',
      error: error.message,
    });
  }
};

// ============================================================
// ASSIGNMENT - Hủy giao bài tập
// ============================================================

export const unassignHomework = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { homeworkId, studentId } = req.params;
    
    await homeworkQueries.unassignHomeworkNew(homeworkId, studentId);
    
    return res.status(200).json({
      success: true,
      message: 'Homework unassigned',
    });
  } catch (error: any) {
    console.error('Error unassigning homework:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unassign homework',
      error: error.message,
    });
  }
};

// ============================================================
// GRADING - Chấm điểm bài nộp
// ============================================================

export const gradeSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tutorId = req.user?.userId;
    const { submissionId } = req.params;
    const { score, feedback } = req.body;
    
    if (!tutorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const submission = await homeworkQueries.gradeSubmissionNew(submissionId, tutorId, {
      score: parseFloat(score),
      feedback
    });
    
    return res.status(200).json({
      success: true,
      message: 'Submission graded',
      data: submission,
    });
  } catch (error: any) {
    console.error('Error grading submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: error.message,
    });
  }
};

// ============================================================
// STUDENT - Lấy danh sách bài tập được giao
// ============================================================

export const getStudentHomeworks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const homeworks = await homeworkQueries.getStudentHomeworksNew(studentId);
    
    return res.status(200).json({
      success: true,
      message: 'Student homeworks retrieved',
      data: homeworks,
    });
  } catch (error: any) {
    console.error('Error getting student homeworks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get student homeworks',
      error: error.message,
    });
  }
};

// ============================================================
// STUDENT - Lấy chi tiết bài tập
// ============================================================

export const getStudentHomeworkDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const { homeworkId } = req.params;
    
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const homework = await homeworkQueries.getStudentHomeworkDetailNew(homeworkId, studentId);
    
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Student homework detail retrieved',
      data: homework,
    });
  } catch (error: any) {
    console.error('Error getting student homework detail:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get student homework detail',
      error: error.message,
    });
  }
};

// ============================================================
// STUDENT - Nộp bài tập
// ============================================================

export const submitHomework = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const { homeworkId } = req.params;
    const { content, attachmentUrl, attachmentName, attachmentType } = req.body;
    
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Get assignment_id from homework_id and student_id
    const assignmentId = await homeworkQueries.getAssignmentIdNew(homeworkId, studentId);
    
    if (!assignmentId) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    const submission = await homeworkQueries.submitHomeworkNew({
      assignmentId,
      studentId,
      content,
      attachmentUrl,
      attachmentName,
      attachmentType
    });
    
    return res.status(201).json({
      success: true,
      message: 'Homework submitted',
      data: submission,
    });
  } catch (error: any) {
    console.error('Error submitting homework:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit homework',
      error: error.message,
    });
  }
};
