/**
 * File: applications.js
 * Mục đích: Định nghĩa routes cho Application APIs
 * Vai trò:
 *   - Map HTTP methods đến application controller functions
 *   - Định nghĩa Swagger documentation cho endpoints
 * Lưu ý:
 *   - Routes này handle prefix /api/applications (defined in app.js)
 *   - Application data lưu trong MongoDB
 *   - Gia sư tạo đơn ứng tuyển, phụ huynh xem xét và chấp nhận/từ chối
 */

const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
} = require('../controllers/applicationController');

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Application management API (MongoDB)
 */

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get all applications (với filter options)
 *     tags: [Applications]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, withdrawn]
 *         description: Filter by status
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by class ID
 *       - in: query
 *         name: tutorId
 *         schema:
 *           type: string
 *         description: Filter by tutor ID
 *     responses:
 *       200:
 *         description: List of applications
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
 */
router.get('/', getApplications);

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get application by ID
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       404:
 *         description: Application not found
 */
router.get('/:id', getApplicationById);

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Create new application (gia sư ứng tuyển vào lớp)
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - tutorId
 *             properties:
 *               classId:
 *                 type: string
 *                 description: ID của lớp học
 *               tutorId:
 *                 type: string
 *                 description: ID của gia sư
 *               coverLetter:
 *                 type: string
 *                 description: Thư giới thiệu
 *               proposedRate:
 *                 type: number
 *                 description: Mức phí đề xuất (VNĐ/giờ)
 *               experience:
 *                 type: string
 *                 description: Kinh nghiệm liên quan
 *               availability:
 *                 type: string
 *                 description: Lịch có thể dạy
 *     responses:
 *       201:
 *         description: Application created
 *       400:
 *         description: Bad request (e.g., already applied)
 */
router.post('/', createApplication);

/**
 * @swagger
 * /api/applications/{id}:
 *   put:
 *     summary: Update application (phụ huynh chấp nhận/từ chối, hoặc gia sư cập nhật)
 *     tags: [Applications]
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
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, withdrawn]
 *               coverLetter:
 *                 type: string
 *               proposedRate:
 *                 type: number
 *               experience:
 *                 type: string
 *               availability:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application updated
 */
router.put('/:id', updateApplication);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: Delete/withdraw application (chỉ cho pending applications)
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application deleted
 *       400:
 *         description: Cannot delete non-pending application
 */
router.delete('/:id', deleteApplication);

module.exports = router;
