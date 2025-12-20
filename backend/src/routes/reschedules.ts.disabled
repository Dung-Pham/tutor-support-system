/**
 * File: routes/reschedules.ts
 * Mục đích: Define routes cho reschedule management
 */

import { Router } from 'express';
import * as rescheduleController from '../controllers/rescheduleController';
import { createRescheduleValidation, reviewRescheduleValidation, idParamValidation } from '../utils/validator';

const router = Router();

/**
 * @swagger
 * /api/reschedules:
 *   post:
 *     summary: Create reschedule request
 *     tags: [Reschedules]
 */
router.post('/', createRescheduleValidation(), rescheduleController.createReschedule);

/**
 * @swagger
 * /api/reschedules/pending:
 *   get:
 *     summary: Get pending reschedule requests
 *     tags: [Reschedules]
 */
router.get('/pending', rescheduleController.getPendingReschedules);

/**
 * @swagger
 * /api/reschedules/{rescheduleId}:
 *   get:
 *     summary: Get reschedule request by ID
 *     tags: [Reschedules]
 */
router.get('/:rescheduleId', idParamValidation('rescheduleId'), rescheduleController.getReschedule);

/**
 * @swagger
 * /api/reschedules/{rescheduleId}/review:
 *   post:
 *     summary: Review reschedule request (approve/reject)
 *     tags: [Reschedules]
 */
router.post('/:rescheduleId/review', reviewRescheduleValidation(), rescheduleController.reviewReschedule);

/**
 * @swagger
 * /api/reschedules/{rescheduleId}/cancel:
 *   post:
 *     summary: Cancel reschedule request
 *     tags: [Reschedules]
 */
router.post('/:rescheduleId/cancel', idParamValidation('rescheduleId'), rescheduleController.cancelReschedule);

export default router;
