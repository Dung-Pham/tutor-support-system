/**
 * File: routes/newHomework.ts
 * Mục đích: Routes cho Homework Management System (Module VI)
 * Features:
 *   - Tutor: Tạo, sửa, xóa bài tập
 *   - Tutor: Giao bài tập cho học viên
 *   - Tutor: Chấm điểm bài nộp
 *   - Tutor: Xem danh sách học viên
 *   - Student: Xem bài tập được giao
 *   - Student: Nộp bài tập
 */

import { Router } from 'express';
import * as newHomeworkController from '../controllers/newHomeworkController';

const router = Router();

// ============================================================
// TUTOR ROUTES - Quản lý bài tập
// ============================================================

// GET /api/new-homework/tutor - Lấy danh sách bài tập của tutor
router.get('/tutor', newHomeworkController.getTutorHomeworks);

// GET /api/new-homework/tutor/:homeworkId - Lấy chi tiết bài tập
router.get('/tutor/:homeworkId', newHomeworkController.getHomeworkDetail);

// POST /api/new-homework/tutor - Tạo bài tập mới
router.post('/tutor', newHomeworkController.createHomework);

// PUT /api/new-homework/tutor/:homeworkId - Sửa bài tập
router.put('/tutor/:homeworkId', newHomeworkController.updateHomework);

// DELETE /api/new-homework/tutor/:homeworkId - Xóa bài tập
router.delete('/tutor/:homeworkId', newHomeworkController.deleteHomework);

// GET /api/new-homework/tutor/students - Lấy danh sách học viên
router.get('/tutor/students', newHomeworkController.getTutorStudents);

// ============================================================
// ASSIGNMENT ROUTES - Giao bài tập
// ============================================================

// POST /api/new-homework/tutor/:homeworkId/assign - Giao bài tập
router.post('/tutor/:homeworkId/assign', newHomeworkController.assignHomework);

// DELETE /api/new-homework/tutor/:homeworkId/assign/:studentId - Hủy giao bài tập
router.delete('/tutor/:homeworkId/assign/:studentId', newHomeworkController.unassignHomework);

// ============================================================
// GRADING ROUTES - Chấm điểm
// ============================================================

// POST /api/new-homework/tutor/grade/:submissionId - Chấm điểm bài nộp
router.post('/tutor/grade/:submissionId', newHomeworkController.gradeSubmission);

// ============================================================
// STUDENT ROUTES - Học viên nộp bài
// ============================================================

// GET /api/new-homework/student - Lấy danh sách bài tập được giao
router.get('/student', newHomeworkController.getStudentHomeworks);

// GET /api/new-homework/student/:homeworkId - Lấy chi tiết bài tập
router.get('/student/:homeworkId', newHomeworkController.getStudentHomeworkDetail);

// POST /api/new-homework/student/:homeworkId/submit - Nộp bài tập
router.post('/student/:homeworkId/submit', newHomeworkController.submitHomework);

export default router;
