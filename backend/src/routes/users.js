/**
 * File: users.js
 * Mục đích: Định nghĩa routes cho User APIs
 * Vai trò:
 *   - Map HTTP methods đến controller functions
 *   - Định nghĩa Swagger documentation cho endpoints
 * Lưu ý:
 *   - Routes này handle prefix /api/users (defined in app.js)
 *   - Cần thêm authentication middleware cho các route bảo mật
 *   - Swagger comments phải tuân thủ chuẩn OpenAPI 3.0
 */

const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getTutorProfile,
  getStudentProfile,
  getParentProfile,
  getAllTutors,
} = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [UserAccount]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/', getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [UserAccount]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
// Place generic ID route after specific routes to avoid collisions (e.g., /tutors)
// router.get('/:id', getUserById) moved below

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user
 *     tags: [UserAccount]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/', createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [UserAccount]
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
 *     responses:
 *       200:
 *         description: User updated
 */
// router.put('/:id', updateUser) moved below

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [UserAccount]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
// router.delete('/:id', deleteUser) moved below

/**
 * @swagger
 * /api/users/tutors:
 *   get:
 *     summary: Get all tutors with profiles
 *     tags: [UserAccount]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: subjects
 *         schema:
 *           type: string
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of tutors
 */
router.get('/tutors', getAllTutors);

/**
 * @swagger
 * /api/users/tutor/{id}:
 *   get:
 *     summary: Get tutor profile by user ID
 *     tags: [UserAccount]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tutor profile
 */
router.get('/tutor/:id', getTutorProfile);

/**
 * @swagger
 * /api/users/student/{id}:
 *   get:
 *     summary: Get student profile by user ID
 *     tags: [UserAccount]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Student profile
 */
router.get('/student/:id', getStudentProfile);

/**
 * @swagger
 * /api/users/parent/{id}:
 *   get:
 *     summary: Get parent profile by user ID
 *     tags: [UserAccount]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Parent profile
 */
router.get('/parent/:id', getParentProfile);

// Generic ID routes must come after specific routes to prevent matching conflicts
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
