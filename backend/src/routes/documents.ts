/**
 * File: routes/documents.ts
 * Purpose: Routes for document management
 */

import { Router } from 'express';
import * as documentController from '../controllers/documentController';
import { authenticate } from '../middlewares/auth';
import { uploadDocument } from '../middlewares/upload';
import { idParamValidation } from '../utils/validator';

const router = Router();

/**
 * @swagger
 * /api/documents/my-documents:
 *   get:
 *     summary: Get my documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-documents', authenticate, documentController.getMyDocuments);

/**
 * @swagger
 * /api/documents/students:
 *   get:
 *     summary: Get tutor's students (for sharing)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get('/students', authenticate, documentController.getTutorStudents);

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post('/upload', authenticate, uploadDocument.single('file'), documentController.uploadDocument);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
 */
router.get('/:documentId', authenticate, idParamValidation('documentId'), documentController.getDocumentById);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   put:
 *     summary: Update document
 *     tags: [Documents]
 */
router.put('/:documentId', authenticate, idParamValidation('documentId'), documentController.updateDocument);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
 */
router.delete('/:documentId', authenticate, idParamValidation('documentId'), documentController.deleteDocument);

/**
 * @swagger
 * /api/documents/{documentId}/download:
 *   get:
 *     summary: Download document
 *     tags: [Documents]
 */
router.get('/:documentId/download', authenticate, idParamValidation('documentId'), documentController.downloadDocument);

/**
 * @swagger
 * /api/documents/{documentId}/permissions:
 *   get:
 *     summary: Get document permissions
 *     tags: [Documents]
 */
router.get('/:documentId/permissions', authenticate, idParamValidation('documentId'), documentController.getDocumentPermissions);

/**
 * @swagger
 * /api/documents/{documentId}/permissions:
 *   post:
 *     summary: Grant document permission
 *     tags: [Documents]
 */
router.post('/:documentId/permissions', authenticate, idParamValidation('documentId'), documentController.grantPermission);

/**
 * @swagger
 * /api/documents/{documentId}/permissions/{permissionId}:
 *   delete:
 *     summary: Revoke document permission
 *     tags: [Documents]
 */
router.delete('/:documentId/permissions/:permissionId', authenticate, documentController.revokePermission);

export default router;
