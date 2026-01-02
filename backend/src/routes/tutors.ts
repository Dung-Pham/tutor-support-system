/**
 * File: routes/tutors.ts
 * Purpose: Routes for Tutor management (Student's tutors)
 */

import { Router } from 'express';
import * as tutorController from '../controllers/tutorController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/tutors/my-tutors - Get all tutors of current student
router.get('/my-tutors', tutorController.getMyTutors);

// GET /api/tutors/my-tutors/search - Search tutors (must be before :tutorId)
router.get('/my-tutors/search', tutorController.searchTutors);

// GET /api/tutors/my-tutors/:tutorId - Get single tutor detail
router.get('/my-tutors/:tutorId', tutorController.getTutorById);

export default router;
