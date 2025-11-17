/**
 * File: routes/schedules.ts
 * Mục đích: Define routes cho schedule management
 * Vai trò: Map HTTP endpoints to controller functions
 */

import { Router } from 'express';
import * as scheduleController from '../controllers/scheduleController';
import { authenticate } from '../middlewares/auth';
import {
  createScheduleValidation,
  updateScheduleValidation,
  calendarViewValidation,
  timeBlockValidation,
  idParamValidation
} from '../utils/validator';

const router = Router();

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutorRequestId
 *               - startTime
 *               - endTime
 *             properties:
 *               tutorRequestId:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Schedule created successfully
 */
router.post('/', createScheduleValidation(), scheduleController.createSchedule);

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Get schedules with filters and pagination
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: tutorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedules retrieved successfully
 */
router.get('/', scheduleController.getSchedules);

/**
 * @swagger
 * /api/schedules/calendar:
 *   get:
 *     summary: Get calendar view
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userRole
 *         required: true
 *         schema:
 *           type: string
 *           enum: [tutor, student, parent]
 *       - in: query
 *         name: viewType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Calendar view retrieved successfully
 */
// Updated calendar route expects UUID userId & userRole in ['tutor','user']
router.get('/calendar', authenticate, calendarViewValidation(), scheduleController.getCalendarView);

/**
 * @swagger
 * /api/schedules/{scheduleId}:
 *   get:
 *     summary: Get schedule by ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule retrieved successfully
 */
// scheduleId now UUID
router.get('/:scheduleId', idParamValidation('scheduleId'), scheduleController.getSchedule);

/**
 * @swagger
 * /api/schedules/{scheduleId}:
 *   put:
 *     summary: Update schedule
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 */
router.put('/:scheduleId', updateScheduleValidation(), scheduleController.updateSchedule);

/**
 * @swagger
 * /api/schedules/{scheduleId}:
 *   delete:
 *     summary: Delete schedule
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 */
router.delete('/:scheduleId', idParamValidation('scheduleId'), scheduleController.deleteSchedule);

// ============ TimeBlock Routes ============

/**
 * @swagger
 * /api/schedules/timeblocks:
 *   post:
 *     summary: Create timeblock
 *     tags: [TimeBlocks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutorId
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *     responses:
 *       201:
 *         description: TimeBlock created successfully
 */
// TimeBlock creation uses snake_case fields per new schema (tutor_id, day_of_week, start_time, end_time)
router.post('/timeblocks', timeBlockValidation(), scheduleController.createTimeBlock);

/**
 * @swagger
 * /api/schedules/timeblocks/tutor/{tutorId}:
 *   get:
 *     summary: Get timeblocks by tutor
 *     tags: [TimeBlocks]
 *     parameters:
 *       - in: path
 *         name: tutorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: TimeBlocks retrieved successfully
 */
// Fetch timeblocks by tutor UUID
router.get('/timeblocks/tutor/:tutorId', idParamValidation('tutorId'), scheduleController.getTimeBlocksByTutor);

/**
 * @swagger
 * /api/schedules/timeblocks/available:
 *   get:
 *     summary: Get available timeblocks
 *     tags: [TimeBlocks]
 *     parameters:
 *       - in: query
 *         name: tutorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Available timeblocks retrieved successfully
 */
// Available timeblocks query expects tutor_id & week_start_date (ISO date) per new schema
router.get('/timeblocks/available', scheduleController.getAvailableTimeBlocks);

/**
 * @swagger
 * /api/schedules/timeblocks/{timeBlockId}/status:
 *   patch:
 *     summary: Update timeblock status
 *     tags: [TimeBlocks]
 *     parameters:
 *       - in: path
 *         name: timeBlockId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, locked, booked]
 *     responses:
 *       200:
 *         description: TimeBlock status updated successfully
 */
router.patch('/timeblocks/:timeBlockId/status', idParamValidation('timeBlockId'), scheduleController.updateTimeBlockStatus);

/**
 * @swagger
 * /api/schedules/timeblocks/{timeBlockId}:
 *   delete:
 *     summary: Delete timeblock
 *     tags: [TimeBlocks]
 *     parameters:
 *       - in: path
 *         name: timeBlockId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: TimeBlock deleted successfully
 */
router.delete('/timeblocks/:timeBlockId', idParamValidation('timeBlockId'), scheduleController.deleteTimeBlock);

export default router;
