/**
 * File: routes/statistics.ts
 * Purpose: Routes for Tutor Statistics Dashboard
 * Base path: /api/statistics
 */

import express, { Request, Response, NextFunction } from 'express';
import * as statisticsController from '../controllers/statisticsController';
import * as advancedStatisticsController from '../controllers/advancedStatisticsController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Disable cache for all statistics routes to ensure fresh data
router.use((req: Request, res: Response, next: NextFunction) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// ===== V2 Routes (Advanced with filters) =====

/**
 * @route   GET /api/statistics/v2/all
 * @desc    Get all advanced statistics with filters
 * @access  Private (Tutor only)
 */
router.get('/v2/all', advancedStatisticsController.getAllAdvancedStatistics);

/**
 * @route   GET /api/statistics/v2/overview
 * @desc    Get KPI overview with filters
 * @access  Private (Tutor only)
 */
router.get('/v2/overview', advancedStatisticsController.getAdvancedOverview);

/**
 * @route   GET /api/statistics/v2/sessions-over-time
 * @desc    Get sessions & revenue over time for chart
 * @access  Private (Tutor only)
 */
router.get('/v2/sessions-over-time', advancedStatisticsController.getSessionsOverTime);

/**
 * @route   GET /api/statistics/v2/time-distribution
 * @desc    Get time distribution by class for pie chart
 * @access  Private (Tutor only)
 */
router.get('/v2/time-distribution', advancedStatisticsController.getTimeDistribution);

/**
 * @route   GET /api/statistics/v2/learning-effectiveness
 * @desc    Get learning effectiveness for stacked bar chart
 * @access  Private (Tutor only)
 */
router.get('/v2/learning-effectiveness', advancedStatisticsController.getLearningEffectiveness);

/**
 * @route   GET /api/statistics/v2/top-students
 * @desc    Get top performing students
 * @access  Private (Tutor only)
 */
router.get('/v2/top-students', advancedStatisticsController.getTopStudents);

/**
 * @route   GET /api/statistics/v2/students-needing-attention
 * @desc    Get students needing attention
 * @access  Private (Tutor only)
 */
router.get('/v2/students-needing-attention', advancedStatisticsController.getStudentsNeedingAttention);

/**
 * @route   GET /api/statistics/v2/classes
 * @desc    Get class options for filter dropdown
 * @access  Private (Tutor only)
 */
router.get('/v2/classes', advancedStatisticsController.getClassOptions);

// ===== V1 Routes (Basic - kept for backward compatibility) =====

/**
 * @route   GET /api/statistics/all
 * @desc    Get all statistics in one call
 * @access  Private (Tutor only)
 */
router.get('/all', statisticsController.getAllStatistics);

/**
 * @route   GET /api/statistics/overview
 * @desc    Get overview statistics
 * @access  Private (Tutor only)
 */
router.get('/overview', statisticsController.getOverview);

/**
 * @route   GET /api/statistics/classes
 * @desc    Get classes with progress
 * @access  Private (Tutor only)
 */
router.get('/classes', statisticsController.getClassesProgress);

/**
 * @route   GET /api/statistics/upcoming
 * @desc    Get upcoming homework deadlines
 * @access  Private (Tutor only)
 */
router.get('/upcoming', statisticsController.getUpcomingHomeworks);

/**
 * @route   GET /api/statistics/submissions
 * @desc    Get recent submissions
 * @access  Private (Tutor only)
 */
router.get('/submissions', statisticsController.getRecentSubmissions);

/**
 * @route   GET /api/statistics/students
 * @desc    Get student activities
 * @access  Private (Tutor only)
 */
router.get('/students', statisticsController.getStudentActivities);

export default router;
