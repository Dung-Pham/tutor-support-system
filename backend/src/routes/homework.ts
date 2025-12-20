/**
 * File: routes/homework.ts
 * Purpose: Define routes for homework & materials management
 * Schema: Matches tutorsupportdb_merged-v2.sql
 */

import { Router } from 'express';
import * as homeworkController from '../controllers/homeworkController';
import { body, param } from 'express-validator';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Apply authentication middleware
router.use(authenticate);

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
  body('title').notEmpty().withMessage('title is required'),
  body('description').optional({ values: 'null' }).isString(),
  // Accept both snake_case and camelCase - use { values: 'falsy' } to treat empty strings as optional
  body('class_id').optional({ values: 'falsy' }).isUUID().withMessage('class_id must be a valid UUID'),
  body('classId').optional({ values: 'falsy' }).isUUID().withMessage('classId must be a valid UUID'),
  body('schedule_id').optional({ values: 'falsy' }).isUUID().withMessage('schedule_id must be a valid UUID'),
  body('due_date').optional({ values: 'falsy' }).isISO8601().withMessage('due_date must be a valid date'),
  body('dueDate').optional({ values: 'falsy' }).isISO8601().withMessage('dueDate must be a valid date'),
  body('maxScore').optional({ values: 'falsy' }).isNumeric().withMessage('maxScore must be a number'),
  body('max_score').optional({ values: 'falsy' }).isNumeric().withMessage('max_score must be a number'),
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
  body('score').isNumeric().withMessage('score must be a number'),
  body('feedback').optional().isString(),
];

// ============================================================
// TUTOR ROUTES - /api/homework/tutor/*
// IMPORTANT: Static routes must be defined BEFORE dynamic :param routes
// ============================================================

/**
 * @route   GET /api/homework/tutor/students
 * @desc    Get list of students for homework assignment
 * @access  Private (Tutor only)
 * NOTE: This static route MUST come before /tutor/:homeworkId
 */
router.get('/tutor/students', homeworkController.getTutorStudents);

/**
 * @route   POST /api/homework/tutor/grade/:submissionId
 * @desc    Grade student submission
 * @access  Private (Tutor only)
 * NOTE: This static route MUST come before /tutor/:homeworkId
 */
router.post('/tutor/grade/:submissionId', gradeHomeworkValidation(), homeworkController.gradeSubmission);

/**
 * @route   GET /api/homework/tutor
 * @desc    Get all homeworks created by tutor
 * @access  Private (Tutor only)
 */
router.get('/tutor', homeworkController.getHomeworkList);

/**
 * @route   POST /api/homework/tutor
 * @desc    Create new homework
 * @access  Private (Tutor only)
 */
router.post('/tutor', createHomeworkValidation(), homeworkController.createHomework);

/**
 * @route   GET /api/homework/tutor/:homeworkId
 * @desc    Get homework detail with assignments
 * @access  Private (Tutor only)
 */
router.get('/tutor/:homeworkId', uuidValidation('homeworkId'), homeworkController.getHomeworkById);

/**
 * @route   PUT /api/homework/tutor/:homeworkId
 * @desc    Update homework
 * @access  Private (Tutor only)
 */
router.put('/tutor/:homeworkId', updateHomeworkValidation(), homeworkController.updateHomework);

/**
 * @route   DELETE /api/homework/tutor/:homeworkId
 * @desc    Delete homework
 * @access  Private (Tutor only)
 */
router.delete('/tutor/:homeworkId', uuidValidation('homeworkId'), homeworkController.deleteHomework);

/**
 * @route   POST /api/homework/tutor/:homeworkId/assign
 * @desc    Assign homework to student
 * @access  Private (Tutor only)
 */
router.post('/tutor/:homeworkId/assign', uuidValidation('homeworkId'), homeworkController.assignHomeworkToStudent);

/**
 * @route   DELETE /api/homework/tutor/:homeworkId/assign/:studentId
 * @desc    Unassign homework from student
 * @access  Private (Tutor only)
 */
router.delete('/tutor/:homeworkId/assign/:studentId', homeworkController.deleteAssignment);

// ============================================================
// STUDENT ROUTES - /api/homework/student/*
// ============================================================

/**
 * @route   GET /api/homework/student
 * @desc    Get all homeworks assigned to student
 * @access  Private (Student only)
 */
router.get('/student', homeworkController.getStudentAssignments);

/**
 * @route   GET /api/homework/student/:assignmentId
 * @desc    Get assignment detail
 * @access  Private (Student only)
 */
router.get('/student/:assignmentId', uuidValidation('assignmentId'), homeworkController.getAssignmentById);

/**
 * @route   POST /api/homework/student/:assignmentId/submit
 * @desc    Submit homework
 * @access  Private (Student only)
 */
router.post('/student/:assignmentId/submit', submitHomeworkValidation(), homeworkController.submitHomework);

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
