/**
 * File: routes/attendance.ts
 * Mục đích: Define routes cho attendance management
 */

import { Router } from 'express';
import * as attendanceController from '../controllers/attendanceController';
import { updateAttendanceValidation, confirmAttendanceValidation, idParamValidation } from '../utils/validator';

const router = Router();

/**
 * @swagger
 * /api/attendance/schedule/{scheduleId}:
 *   get:
 *     summary: Get or create attendance for a schedule
 *     tags: [Attendance]
 */
router.get('/schedule/:scheduleId', idParamValidation('scheduleId'), attendanceController.getOrCreateAttendance);

/**
 * @swagger
 * /api/attendance/{attendanceId}:
 *   put:
 *     summary: Update attendance status
 *     tags: [Attendance]
 */
// Update attendance by UUID
router.put('/:attendanceId', updateAttendanceValidation(), attendanceController.updateAttendance);

/**
 * @swagger
 * /api/attendance/{attendanceId}/confirm:
 *   post:
 *     summary: Confirm attendance (tutor or user)
 *     tags: [Attendance]
 */
// Confirm attendance (tutor or user) with UUID attendanceId
router.post('/:attendanceId/confirm', confirmAttendanceValidation(), attendanceController.confirmAttendance);

/**
 * @swagger
 * /api/attendance/user/{userId}/history:
 *   get:
 *     summary: Get user attendance history
 *     tags: [Attendance]
 */
// Attendance history for tutor or user UUID
router.get('/user/:userId/history', idParamValidation('userId'), attendanceController.getAttendanceHistory);

/**
 * @swagger
 * /api/attendance/user/{userId}/stats:
 *   get:
 *     summary: Get attendance statistics for a user
 *     tags: [Attendance]
 */
// Attendance stats for tutor or user UUID
router.get('/user/:userId/stats', idParamValidation('userId'), attendanceController.getAttendanceStats);

/**
 * @swagger
 * /api/attendance/pending:
 *   get:
 *     summary: Get pending attendance confirmations
 *     tags: [Attendance]
 */
router.get('/pending', attendanceController.getPendingConfirmations);

export default router;
