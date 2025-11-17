/**
 * File: documents.js
 * Mục đích: Định nghĩa routes cho Document APIs
 * Vai trò:
 *   - Map HTTP methods đến controller functions cho document management
 *   - Định nghĩa Swagger documentation cho endpoints
 * Lưu ý:
 *   - Routes này handle prefix /api/documents (defined in app.js)
 *   - Cần authentication middleware cho tất cả routes
 *   - Swagger comments phải tuân thủ chuẩn OpenAPI 3.0
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authWrapper');
const documentController = require('../controllers/documentController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/documents');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and media types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/avi',
      'video/mov',
      'audio/mpeg',
      'audio/wav'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents, images, and videos are allowed.'), false);
    }
  }
});

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management API
 */

/**
 * @swagger
 * /api/documents/my-documents:
 *   get:
 *     summary: Get documents for current user (tutor's documents or student's accessible documents)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's documents
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
 *                       document_id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       file_name:
 *                         type: string
 *                       file_type:
 *                         type: string
 *                       file_size:
 *                         type: integer
 *                       upload_date:
 *                         type: string
 *                         format: date-time
 *                       shared_count:
 *                         type: integer
 *                         description: Number of students with access (for tutors only)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/my-documents', authenticate, documentController.getMyDocuments);

// Temporary route for testing without auth
router.get('/my-documents-test', documentController.getMyDocuments);

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload a new document (tutors only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - title
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file to upload
 *               title:
 *                 type: string
 *                 description: Document title
 *               description:
 *                 type: string
 *                 description: Document description (optional)
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden (not a tutor)
 *       500:
 *         description: Internal server error
 */
router.post('/upload', authenticate, upload.single('file'), documentController.uploadDocument);

/**
 * @swagger
 * /api/documents/students:
 *   get:
 *     summary: Get tutor's students for permission granting (tutors only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tutor's students
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/students', authenticate, documentController.getStudents);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   get:
 *     summary: Get document details
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update document info (tutors only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete document (tutors only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.get('/:documentId', authenticate, documentController.getDocument);
router.put('/:documentId', authenticate, documentController.updateDocumentInfo);
router.delete('/:documentId', authenticate, documentController.deleteDocumentById);

/**
 * @swagger
 * /api/documents/{documentId}/download:
 *   get:
 *     summary: Download document file
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.get('/:documentId/download', authenticate, documentController.downloadDocument);

/**
 * @swagger
 * /api/documents/{documentId}/permissions:
 *   get:
 *     summary: Get document permissions (tutors only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: List of permissions
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Grant permission to student (tutors only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - permissionType
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student user ID
 *               permissionType:
 *                 type: string
 *                 enum: [VIEW, DOWNLOAD, EDIT]
 *                 description: Permission type
 *     responses:
 *       200:
 *         description: Permission granted successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.get('/:documentId/permissions', authenticate, documentController.getPermissions);
router.post('/:documentId/permissions', authenticate, documentController.grantPermission);

/**
 * @swagger
 * /api/documents/{documentId}/permissions/{studentId}:
 *   delete:
 *     summary: Revoke permission from student (tutors only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student user ID
 *     responses:
 *       200:
 *         description: Permission revoked successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:documentId/permissions/:studentId', authenticate, documentController.revokePermission);

module.exports = router;
