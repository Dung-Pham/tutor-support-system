/**
 * File: routes/evaluations.ts
 * Mục đích: Define routes cho evaluation management
 */

import { Router } from 'express';
import * as evaluationController from '../controllers/evaluationController';
import { createEvaluationValidation, idParamValidation } from '../utils/validator';

const router = Router();

/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: Create progress evaluation
 *     tags: [Evaluations]
 */
router.post('/', createEvaluationValidation(), evaluationController.createEvaluation);

/**
 * @swagger
 * /api/evaluations/{evaluationId}:
 *   get:
 *     summary: Get evaluation by ID
 *     tags: [Evaluations]
 */
router.get('/:evaluationId', idParamValidation('evaluationId'), evaluationController.getEvaluation);

/**
 * @swagger
 * /api/evaluations/class/{classId}:
 *   get:
 *     summary: Get evaluations for a class
 *     tags: [Evaluations]
 */
router.get('/class/:classId', idParamValidation('classId'), evaluationController.getEvaluationsByClass);

/**
 * @swagger
 * /api/evaluations/schedule/{scheduleId}:
 *   get:
 *     summary: Get evaluations by schedule
 *     tags: [Evaluations]
 */
router.get('/schedule/:scheduleId', idParamValidation('scheduleId'), evaluationController.getEvaluationsBySchedule);

/**
 * @swagger
 * /api/evaluations/class/{classId}/statistics:
 *   get:
 *     summary: Get evaluation statistics for a class
 *     tags: [Evaluations]
 */
router.get('/class/:classId/statistics', idParamValidation('classId'), evaluationController.getEvaluationStatistics);

export default router;
