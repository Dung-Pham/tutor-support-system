/**
 * File: routes/homework.ts
 * Purpose: Define routes for homework & materials management
 * Schema: Matches tutorsupportdb_merged-v2.sql
 */

import { Router } from 'express';
import * as homeworkController from '../controllers/homeworkController';
import { body, param } from 'express-validator';

const router = Router();

// ============================================================
// VALIDATION MIDDLEWARE
// ============================================================

const uuidValidation = (field: string) =>
  param(field).isUUID().withMessage(`${field} must be a valid UUID`);

const uploadMaterialValidation = () => [
  body('class_id').isUUID().withMessage('class_id must be a valid UUID'),
  body('schedule_id').optional().isUUID().withMessage('schedule_id must be a valid UUID'),
  body('title').notEmpty().withMessage('title is required'),
  body('file_name').optional().isString(),
  body('file_url').optional().isString(),
];

const createHomeworkValidation = () => [
  body('class_id').isUUID().withMessage('class_id must be a valid UUID'),
  body('schedule_id').optional().isUUID().withMessage('schedule_id must be a valid UUID'),
  body('title').notEmpty().withMessage('title is required'),
  body('description').optional().isString(),
  body('due_date').isISO8601().withMessage('due_date must be a valid date'),
];

const updateHomeworkValidation = () => [
  param('homeworkId').isUUID().withMessage('homeworkId must be a valid UUID'),
  body('title').optional().notEmpty().withMessage('title cannot be empty'),
  body('description').optional().isString(),
  body('due_date').optional().isISO8601().withMessage('due_date must be a valid date'),
];

const submitHomeworkValidation = () => [
  body('homework_id').optional().isUUID().withMessage('homework_id must be a valid UUID'),
  body('file_name').optional().isString(),
  body('file_url').optional().isString(),
];

const gradeHomeworkValidation = () => [
  param('submissionId').isUUID().withMessage('submissionId must be a valid UUID'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('score must be between 0 and 100'),
  body('feedback').optional().isString(),
];

// ============================================================
// MATERIAL ROUTES
// ============================================================

/**
 * @swagger
 * /api/homework/materials:
 *   post:
 *     summary: Upload a material
 *     tags: [Materials]
 */
router.post('/materials', uploadMaterialValidation(), homeworkController.uploadMaterial);

/**
 * @swagger
 * /api/homework/materials:
 *   get:
 *     summary: Get materials list
 *     tags: [Materials]
 */
router.get('/materials', homeworkController.getMaterials);

/**
 * @swagger
 * /api/homework/materials/{materialId}:
 *   get:
 *     summary: Get material by ID
 *     tags: [Materials]
 */
router.get('/materials/:materialId', uuidValidation('materialId'), homeworkController.getMaterialById);

/**
 * @swagger
 * /api/homework/materials/{materialId}:
 *   put:
 *     summary: Update material
 *     tags: [Materials]
 */
// TODO: Implement updateMaterial in homeworkController
// router.put('/materials/:materialId', uuidValidation('materialId'), homeworkController.updateMaterial);

/**
 * @swagger
 * /api/homework/materials/{materialId}:
 *   delete:
 *     summary: Delete material
 *     tags: [Materials]
 */
router.delete('/materials/:materialId', uuidValidation('materialId'), homeworkController.deleteMaterial);

// ============================================================
// HOMEWORK ROUTES
// ============================================================

/**
 * @swagger
 * /api/homework:
 *   post:
 *     summary: Create homework
 *     tags: [Homework]
 */
router.post('/', createHomeworkValidation(), homeworkController.createHomework);

/**
 * @swagger
 * /api/homework:
 *   get:
 *     summary: Get homework list
 *     tags: [Homework]
 */
router.get('/', homeworkController.getHomeworkList);

/**
 * @swagger
 * /api/homework/{homeworkId}:
 *   get:
 *     summary: Get homework by ID
 *     tags: [Homework]
 */
router.get('/:homeworkId', uuidValidation('homeworkId'), homeworkController.getHomeworkById);

/**
 * @swagger
 * /api/homework/{homeworkId}:
 *   put:
 *     summary: Update homework
 *     tags: [Homework]
 */
router.put('/:homeworkId', updateHomeworkValidation(), homeworkController.updateHomework);

/**
 * @swagger
 * /api/homework/{homeworkId}:
 *   delete:
 *     summary: Delete homework
 *     tags: [Homework]
 */
router.delete('/:homeworkId', uuidValidation('homeworkId'), homeworkController.deleteHomework);

/**
 * @swagger
 * /api/homework/class/{classId}/stats:
 *   get:
 *     summary: Get homework statistics for a class
 *     tags: [Homework]
 */
router.get('/class/:classId/stats', uuidValidation('classId'), homeworkController.getHomeworkStatistics);

// ============================================================
// SUBMISSION ROUTES
// ============================================================

/**
 * @swagger
 * /api/homework/{homeworkId}/submit:
 *   post:
 *     summary: Submit homework
 *     tags: [Submissions]
 */
router.post('/:homeworkId/submit', submitHomeworkValidation(), homeworkController.submitHomework);

/**
 * @swagger
 * /api/homework/{homeworkId}/submissions:
 *   get:
 *     summary: Get all submissions for a homework
 *     tags: [Submissions]
 */
router.get('/:homeworkId/submissions', uuidValidation('homeworkId'), homeworkController.getSubmissionsByHomework);

/**
 * @swagger
 * /api/homework/{homeworkId}/my-submission:
 *   get:
 *     summary: Get current user's submission for a homework
 *     tags: [Submissions]
 */
router.get('/:homeworkId/my-submission', uuidValidation('homeworkId'), homeworkController.getStudentSubmission);

/**
 * @swagger
 * /api/homework/{homeworkId}/submissions/{studentId}:
 *   get:
 *     summary: Get a student's submission for a homework
 *     tags: [Submissions]
 */
router.get(
  '/:homeworkId/submissions/:studentId',
  uuidValidation('homeworkId'),
  uuidValidation('studentId'),
  homeworkController.getStudentSubmission
);

/**
 * @swagger
 * /api/homework/submissions/{submissionId}:
 *   get:
 *     summary: Get submission by ID
 *     tags: [Submissions]
 */
router.get('/submissions/:submissionId', uuidValidation('submissionId'), homeworkController.getSubmissionById);

/**
 * @swagger
 * /api/homework/submissions/{submissionId}/grade:
 *   post:
 *     summary: Grade a submission
 *     tags: [Submissions]
 */
router.post('/submissions/:submissionId/grade', gradeHomeworkValidation(), homeworkController.gradeSubmission);

/**
 * @swagger
 * /api/homework/submissions/{submissionId}:
 *   delete:
 *     summary: Delete a submission
 *     tags: [Submissions]
 */
router.delete('/submissions/:submissionId', uuidValidation('submissionId'), homeworkController.deleteSubmission);

/**
 * @swagger
 * /api/homework/student/{studentId}/submissions:
 *   get:
 *     summary: Get all submissions by a student
 *     tags: [Submissions]
 */
// TODO: Implement getSubmissionsByStudent in homeworkController
// router.get('/student/:studentId/submissions', uuidValidation('studentId'), homeworkController.getSubmissionsByStudent);

export default router;
