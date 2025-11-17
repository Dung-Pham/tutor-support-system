/**
 * File: utils/validator.ts
 * Mục đích: Cung cấp các hàm validation cho request data
 * Vai trò: Kiểm tra tính hợp lệ của dữ liệu đầu vào
 */

import { body, param, query, ValidationChain } from 'express-validator';

// ============ Schedule Validators ============

export const createScheduleValidation = (): ValidationChain[] => [
  body('tutorRequestId').isInt({ min: 1 }).withMessage('Valid tutorRequestId is required'),
  body('startTime').isISO8601().withMessage('Valid startTime is required'),
  body('endTime').isISO8601().withMessage('Valid endTime is required'),
  body('notes').optional().isString().trim(),
];

export const updateScheduleValidation = (): ValidationChain[] => [
  param('scheduleId').isInt({ min: 1 }).withMessage('Valid scheduleId is required'),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled']),
  body('notes').optional().isString().trim(),
];

export const calendarViewValidation = (): ValidationChain[] => [
  query('userId')
    .matches(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/)
    .withMessage('Valid userId is required'),
  query('userRole').isIn(['tutor', 'user']).withMessage('Valid userRole is required'),
  query('viewType').isIn(['day', 'week', 'month']).withMessage('Valid viewType is required'),
  query('date').isISO8601().withMessage('Valid date is required'),
];

export const timeBlockValidation = (): ValidationChain[] => [
  body('tutor_id')
    .matches(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/)
    .withMessage('Valid tutor_id is required'),
  body('day_of_week').isInt({ min: 0, max: 6 }).withMessage('day_of_week must be 0-6'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('start_time must be HH:mm format'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('end_time must be HH:mm format'),
];

// ============ Reschedule Validators ============

export const createRescheduleValidation = (): ValidationChain[] => [
  body('scheduleId').isInt({ min: 1 }).withMessage('Valid scheduleId is required'),
  body('reason').isString().trim().notEmpty().withMessage('Reason is required'),
  body('proposedStartTime').isISO8601().withMessage('Valid proposedStartTime is required'),
  body('proposedEndTime').isISO8601().withMessage('Valid proposedEndTime is required'),
];

export const reviewRescheduleValidation = (): ValidationChain[] => [
  param('rescheduleId').isInt({ min: 1 }).withMessage('Valid rescheduleId is required'),
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('reviewNotes').optional().isString().trim(),
];

// ============ Attendance Validators ============

export const updateAttendanceValidation = (): ValidationChain[] => [
  param('attendanceId').isInt({ min: 1 }).withMessage('Valid attendanceId is required'),
  body('status').isIn(['pending', 'present', 'absent', 'late', 'excused']).withMessage('Valid status is required'),
  body('notes').optional().isString().trim(),
];

export const confirmAttendanceValidation = (): ValidationChain[] => [
  param('attendanceId')
    .matches(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/)
    .withMessage('Valid attendanceId is required'),
  body('confirmedBy').isIn(['tutor', 'user']).withMessage('confirmedBy must be tutor or user'),
  body('notes').optional().isString().trim(),
];

// ============ Evaluation Validators ============

export const createEvaluationValidation = (): ValidationChain[] => [
  body('attendance_id')
    .matches(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/)
    .withMessage('Valid attendance_id is required'),
  body('class_id')
    .matches(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/)
    .withMessage('Valid class_id is required'),
  body('schedule_id')
    .matches(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/)
    .withMessage('Valid schedule_id is required'),
  body('overall_rating').isInt({ min: 1, max: 5 }).withMessage('overall_rating must be 1-5'),
  body('understanding_score').optional().isInt({ min: 1, max: 5 }).withMessage('understanding_score must be 1-5'),
  body('participation_score').optional().isInt({ min: 1, max: 5 }).withMessage('participation_score must be 1-5'),
  body('homework_completion').optional().isInt({ min: 1, max: 5 }).withMessage('homework_completion must be 1-5'),
  body('behavior_score').optional().isInt({ min: 1, max: 5 }).withMessage('behavior_score must be 1-5'),
  body('competency_level').optional().isString().trim(),
  body('comments').optional().isString().trim(),
  body('evaluated_by')
    .matches(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/)
    .withMessage('Valid evaluated_by (tutor_id) is required'),
];

// ============ Material & Homework Validators ============

export const uploadMaterialValidation = (): ValidationChain[] => [
  body('scheduleId').optional().isInt({ min: 1 }),
  body('subjectId').isInt({ min: 1 }).withMessage('Valid subjectId is required'),
  body('title').isString().trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString().trim(),
  body('type').isIn(['pdf', 'image', 'video', 'document', 'link']).withMessage('Valid type is required'),
  body('fileUrl').isString().trim().notEmpty().withMessage('fileUrl is required'),
  body('fileSize').optional().isInt({ min: 0 }),
];

export const createHomeworkValidation = (): ValidationChain[] => [
  body('scheduleId').isInt({ min: 1 }).withMessage('Valid scheduleId is required'),
  body('title').isString().trim().notEmpty().withMessage('Title is required'),
  body('description').isString().trim().notEmpty().withMessage('Description is required'),
  body('dueDate').isISO8601().withMessage('Valid dueDate is required'),
  body('maxScore').isInt({ min: 0 }).withMessage('maxScore must be >= 0'),
  body('attachments').optional().isArray(),
];

export const submitHomeworkValidation = (): ValidationChain[] => [
  param('homeworkId').isInt({ min: 1 }).withMessage('Valid homeworkId is required'),
  body('attachments').optional().isArray(),
  body('notes').optional().isString().trim(),
];

export const gradeHomeworkValidation = (): ValidationChain[] => [
  param('submissionId').isInt({ min: 1 }).withMessage('Valid submissionId is required'),
  body('score').isFloat({ min: 0 }).withMessage('score must be >= 0'),
  body('feedback').optional().isString().trim(),
];

// ============ Chat & Notification Validators ============

export const sendMessageValidation = (): ValidationChain[] => [
  body('receiverId').isInt({ min: 1 }).withMessage('Valid receiverId is required'),
  body('scheduleId').optional().isInt({ min: 1 }),
  body('messageType').isIn(['text', 'file', 'image', 'system']).withMessage('Valid messageType is required'),
  body('content').isString().trim().notEmpty().withMessage('Content is required'),
  body('attachments').optional().isArray(),
];

export const createNotificationValidation = (): ValidationChain[] => [
  body('userId').isInt({ min: 1 }).withMessage('Valid userId is required'),
  body('type').isString().trim().notEmpty().withMessage('Type is required'),
  body('title').isString().trim().notEmpty().withMessage('Title is required'),
  body('message').isString().trim().notEmpty().withMessage('Message is required'),
  body('data').optional().isObject(),
];

// ============ Common Validators ============

export const paginationValidation = (): ValidationChain[] => [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('sortBy').optional().isString().trim(),
  query('sortOrder').optional().isIn(['ASC', 'DESC']),
];

export const idParamValidation = (paramName: string = 'id'): ValidationChain[] => [
  param(paramName).isInt({ min: 1 }).withMessage(`Valid ${paramName} is required`),
];
