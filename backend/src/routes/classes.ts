/**
 * File: routes/classes.ts
 * Purpose: Routes for class management
 */

import { Router } from 'express';
import * as classController from '../controllers/classController';
import { authenticate } from '../middlewares/auth';
import { idParamValidation } from '../utils/validator';

const router = Router();

/**
 * @swagger
 * /api/classes/my-classes:
 *   get:
 *     summary: Get my classes (student's classes or tutor's teaching classes)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Classes retrieved successfully
 */
router.get('/my-classes', authenticate, classController.getMyClasses);

/**
 * @swagger
 * /api/classes/active:
 *   get:
 *     summary: Get active classes
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active classes retrieved successfully
 */
router.get('/active', authenticate, classController.getActiveClasses);

/**
 * @swagger
 * /api/classes/{classId}:
 *   get:
 *     summary: Get class by ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class retrieved successfully
 */
router.get('/:classId', idParamValidation('classId'), classController.getClassById);

export default router;
