/**
 * File: routes/lessonPlans.ts
 * Purpose: Define routes for lesson plan management
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import * as lessonPlanController from '../controllers/lessonPlanController';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * Validation middleware
 */
const createValidation = () => [
  body('class_id').isUUID().withMessage('class_id must be a valid UUID'),
  body('lesson_number').isInt({ min: 1 }).withMessage('lesson_number must be a positive integer'),
  body('session_date').isISO8601().withMessage('session_date must be a valid date'),
  body('topic').notEmpty().withMessage('topic is required'),
  body('description').optional().isString(),
  body('status').optional().isIn(['planned', 'completed', 'cancelled']),
];

const updateValidation = () => [
  body('lesson_number').optional().isInt({ min: 1 }),
  body('session_date').optional().isISO8601(),
  body('topic').optional().notEmpty(),
  body('description').optional().isString(),
  body('status').optional().isIn(['planned', 'completed', 'cancelled']),
];

/**
 * @swagger
 * /api/lesson-plans:
 *   post:
 *     summary: Create a new lesson plan
 *     tags: [LessonPlans]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, createValidation(), lessonPlanController.createLessonPlan);

/**
 * @swagger
 * /api/lesson-plans/class/{classId}:
 *   get:
 *     summary: Get lesson plans by class
 *     tags: [LessonPlans]
 *     security:
 *       - bearerAuth: []
 */
router.get('/class/:classId', authenticate, lessonPlanController.getLessonPlansByClass);

/**
 * @swagger
 * /api/lesson-plans/stats/{classId}:
 *   get:
 *     summary: Get class statistics
 *     tags: [LessonPlans]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats/:classId', authenticate, lessonPlanController.getClassStatistics);

/**
 * @swagger
 * /api/lesson-plans/bulk/{classId}:
 *   post:
 *     summary: Bulk create lesson plans
 *     tags: [LessonPlans]
 *     security:
 *       - bearerAuth: []
 */
router.post('/bulk/:classId', authenticate, lessonPlanController.bulkCreateLessonPlans);

/**
 * @swagger
 * /api/lesson-plans/{lessonPlanId}:
 *   get:
 *     summary: Get lesson plan by ID
 *     tags: [LessonPlans]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:lessonPlanId', authenticate, lessonPlanController.getLessonPlanById);

/**
 * @swagger
 * /api/lesson-plans/{lessonPlanId}:
 *   put:
 *     summary: Update lesson plan
 *     tags: [LessonPlans]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:lessonPlanId', authenticate, updateValidation(), lessonPlanController.updateLessonPlan);

/**
 * @swagger
 * /api/lesson-plans/{lessonPlanId}/complete:
 *   put:
 *     summary: Mark lesson as completed
 *     tags: [LessonPlans]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:lessonPlanId/complete', authenticate, lessonPlanController.markLessonCompleted);

/**
 * @swagger
 * /api/lesson-plans/{lessonPlanId}:
 *   delete:
 *     summary: Delete lesson plan
 *     tags: [LessonPlans]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:lessonPlanId', authenticate, lessonPlanController.deleteLessonPlan);

export default router;
