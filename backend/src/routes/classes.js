/**
 * File: classes.js
 * Mục đích: Định nghĩa routes cho Class APIs
 * Vai trò:
 *   - Map HTTP methods đến controller functions cho class management
 *   - Định nghĩa Swagger documentation cho endpoints
 * Lưu ý:
 *   - Routes này handle prefix /api/classes (defined in app.js)
 *   - Cần authentication middleware cho tất cả routes
 *   - Swagger comments phải tuân thủ chuẩn OpenAPI 3.0
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authWrapper');
const classController = require('../controllers/classController');

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: Class management API
 */

/**
 * @swagger
 * /api/classes/my-classes:
 *   get:
 *     summary: Get classes for current user (student's enrolled classes or tutor's teaching classes)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       class_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       subject:
 *                         type: string
 *                       grade_level:
 *                         type: string
 *                       start_date:
 *                         type: string
 *                         format: date
 *                       end_date:
 *                         type: string
 *                         format: date
 *                       status:
 *                         type: string
 *                         enum: [ACTIVE, INACTIVE, COMPLETED]
 *                       tutor_name:
 *                         type: string
 *                       student_name:
 *                         type: string
 *                       session_count:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/my-classes', authenticate, classController.getMyClasses);

// Temporary route for testing without auth
router.get('/my-classes-test', classController.getMyClasses);

module.exports = router;