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
  idParamValidation
} from '../utils/validator';

const router = Router();

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Create new schedules for multiple days of the week
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - class_id
 *               - days_of_week
 *               - start_time
 *               - end_time
 *             properties:
 *               class_id:
 *                 type: string
 *                 format: uuid
 *                 description: The class ID
 *               days_of_week:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 6
 *                 description: Array of days (0=Sunday, 1=Monday, ..., 6=Saturday)
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: Start time in HH:mm format
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: End time in HH:mm format
 *               duration_minutes:
 *                 type: integer
 *                 description: Duration in minutes (optional)
 *               is_active:
 *                 type: boolean
 *                 description: Whether the schedule is active (optional, default true)
 *     responses:
 *       201:
 *         description: Schedules created successfully
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
 * /api/schedules/week/{weekStartDate}:
 *   get:
 *     summary: Get schedules for a specific week
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: weekStartDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date of the week (Monday) in YYYY-MM-DD format
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID (tutor or student)
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [tutor, student]
 *     responses:
 *       200:
 *         description: Week schedules retrieved successfully
 */
router.get('/week/:weekStartDate', scheduleController.getWeekSchedules);

/**
 * @swagger
 * /api/schedules/template/weekly:
 *   get:
 *     summary: Get weekly schedule template for current user
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly template retrieved successfully
 */
router.get('/template/weekly', authenticate, scheduleController.getWeeklyTemplate);

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

/**
 * @swagger
 * /api/schedules/week/{weekStartDate}:
 *   get:
 *     summary: Get schedule instances for a specific week
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: weekStartDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Week start date (YYYY-MM-DD)
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [tutor, student]
 *         description: User role
 *     responses:
 *       200:
 *         description: Schedule instances for the week
 */
router.get('/week/:weekStartDate', scheduleController.getSessionsByWeek);

// Note: TimeBlock routes have been removed in favor of Schedule-based approach
// The Schedule table now handles recurring time slots with day_of_week, start_time, end_time

export default router;
