/**
 * File: classes.js
 * Mục đích: Định nghĩa routes cho Class APIs
 * Vai trò:
 *   - Map HTTP methods đến class controller functions
 *   - Định nghĩa Swagger documentation cho endpoints
 * Lưu ý:
 *   - Routes này handle prefix /api/classes (defined in app.js)
 *   - Class data lưu trong MongoDB
 *   - Phụ huynh tạo lớp, gia sư tìm kiếm và ứng tuyển
 */

const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassApplications,
} = require('../controllers/classController');

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: Class management API (MongoDB)
 */

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Get all classes (với filter options)
 *     tags: [Classes]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in-progress, closed]
 *         description: Filter by status
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject (partial match)
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Filter by parent ID
 *     responses:
 *       200:
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Class'
 */
router.get('/', getClasses);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Get class by ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       404:
 *         description: Class not found
 */
router.get('/:id', getClassById);

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Create new class (phụ huynh tạo lớp học)
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - parentId
 *               - subject
 *               - description
 *               - schedule
 *             properties:
 *               parentId:
 *                 type: string
 *                 description: ID của phụ huynh
 *               subject:
 *                 type: string
 *                 description: Môn học
 *               description:
 *                 type: string
 *                 description: Mô tả chi tiết
 *               requirements:
 *                 type: string
 *                 description: Yêu cầu đối với gia sư
 *               schedule:
 *                 type: string
 *                 description: Lịch học dự kiến
 *               budget:
 *                 type: number
 *                 description: Ngân sách (VNĐ/giờ)
 *               location:
 *                 type: string
 *                 description: Địa điểm học
 *               studentLevel:
 *                 type: string
 *                 description: Trình độ học sinh
 *               sessionsPerWeek:
 *                 type: number
 *                 description: Số buổi học mỗi tuần
 *     responses:
 *       201:
 *         description: Class created
 */
router.post('/', createClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: Update class (phụ huynh cập nhật thông tin lớp)
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               schedule:
 *                 type: string
 *               budget:
 *                 type: number
 *               location:
 *                 type: string
 *               studentLevel:
 *                 type: string
 *               sessionsPerWeek:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [open, in-progress, closed]
 *               selectedTutorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Class updated
 */
router.put('/:id', updateClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Delete class
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class deleted
 */
router.delete('/:id', deleteClass);

/**
 * @swagger
 * /api/classes/{id}/applications:
 *   get:
 *     summary: Get all applications for a specific class
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: List of applications for the class
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *       404:
 *         description: Class not found
 */
router.get('/:id/applications', getClassApplications);

module.exports = router;
