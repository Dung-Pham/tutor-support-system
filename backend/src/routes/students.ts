/**
 * File: routes/students.ts
 * Purpose: Routes for Student management (Tutor's students list)
 * Base path: /api/students
 */

import express from 'express';
import * as studentController from '../controllers/studentController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/students
 * @desc    Get all students of current tutor
 * @access  Private (Tutor only)
 */
router.get('/', studentController.getMyStudents);

/**
 * @route   GET /api/students/search
 * @desc    Search students by name or email
 * @access  Private (Tutor only)
 */
router.get('/search', studentController.searchStudents);

/**
 * @route   GET /api/students/:studentId
 * @desc    Get single student detail
 * @access  Private (Tutor only)
 */
router.get('/:studentId', studentController.getStudentById);

export default router;
