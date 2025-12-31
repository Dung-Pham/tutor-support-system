/**
 * File: routes/attendance.ts
 * Purpose: Define routes for attendance management
 * Updated: session/:scheduleId/:sessionDate pattern
 */

import { Router } from 'express';
import * as attendanceController from '../controllers/attendanceController';
import { updateAttendanceValidation, confirmAttendanceValidation, idParamValidation } from '../utils/validator';

const router = Router();

/**
 * @swagger
 * /api/attendance/session/{scheduleId}/{sessionDate}:
 *   get:
 *     summary: Get or create attendance for a schedule on specific date
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: sessionDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Session date in YYYY-MM-DD format
 */
router.get('/session/:scheduleId/:sessionDate', attendanceController.getOrCreateAttendance);

/**
 * @swagger
 * /api/attendance/{attendanceId}:
 *   put:
 *     summary: Update attendance status
 *     tags: [Attendance]
 */
router.put('/:attendanceId', updateAttendanceValidation(), attendanceController.updateAttendance);

/**
 * @swagger
 * /api/attendance/{attendanceId}/confirm:
 *   post:
 *     summary: Confirm attendance (tutor or student)
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmedBy:
 *                 type: string
 *                 enum: [tutor, student]
 *               notes:
 *                 type: string
 */
router.post('/:attendanceId/confirm', confirmAttendanceValidation(), attendanceController.confirmAttendance);

/**
 * @swagger
 * /api/attendance/user/{userId}/history:
 *   get:
 *     summary: Get user attendance history
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [tutor, student]
 */
router.get('/user/:userId/history', idParamValidation('userId'), attendanceController.getAttendanceHistory);

/**
 * @swagger
 * /api/attendance/user/{userId}/stats:
 *   get:
 *     summary: Get attendance statistics for a user
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [tutor, student]
 */
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
