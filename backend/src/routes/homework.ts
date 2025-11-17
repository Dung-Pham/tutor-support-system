/**
 * File: routes/homework.ts
 * Mục đích: Define routes cho homework & materials management
 */

import { Router } from 'express';
import * as homeworkController from '../controllers/homeworkController';
import { 
  uploadMaterialValidation, 
  createHomeworkValidation, 
  submitHomeworkValidation, 
  gradeHomeworkValidation,
  idParamValidation 
} from '../utils/validator';

const router = Router();

// Material routes
router.post('/materials', uploadMaterialValidation(), homeworkController.uploadMaterial);
router.get('/materials/subject/:subjectId', idParamValidation('subjectId'), homeworkController.getMaterialsBySubject);

// Homework routes
router.post('/', createHomeworkValidation(), homeworkController.createHomework);
router.get('/:homeworkId', idParamValidation('homeworkId'), homeworkController.getHomework);
router.get('/student/:studentId', idParamValidation('studentId'), homeworkController.getHomeworkForStudent);

// Submission routes
router.post('/:homeworkId/submit', submitHomeworkValidation(), homeworkController.submitHomework);
router.post('/submissions/:submissionId/grade', gradeHomeworkValidation(), homeworkController.gradeSubmission);
router.get('/:homeworkId/submissions', idParamValidation('homeworkId'), homeworkController.getSubmissionsByHomework);

export default router;
