/**
 * File: controllers/documentController.ts
 * Purpose: Handle HTTP requests for document management
 */

import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import * as documentQueries from '../database/queries/documentQueries';
import path from 'path';
import fs from 'fs';

/**
 * Get my documents
 * GET /api/documents/my-documents
 * Returns documents for current user (tutor's docs or student's accessible docs)
 */
export const getMyDocuments = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
    }

    let documents;
    if (userRole === 'TUTOR') {
      documents = await documentQueries.getTutorDocuments(userId);
    } else {
      documents = await documentQueries.getStudentDocuments(userId);
    }

    return res.status(200).json({
      success: true,
      message: 'Documents retrieved successfully',
      data: documents
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error getting documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Upload document
 * POST /api/documents/upload
 */
export const uploadDocument = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();

    if (!userId || userRole !== 'TUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can upload documents'
      } as ApiResponse);
    }

    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      } as ApiResponse);
    }

    const fileUrl = `/uploads/documents/${file.filename}`;

    const document = await documentQueries.createDocument({
      tutor_id: userId,
      title: title || file.originalname,
      description: description || null,
      file_name: file.originalname,
      file_path: file.path,
      file_url: fileUrl,
      file_type: file.mimetype,
      file_size: file.size,
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get document by ID
 * GET /api/documents/:documentId
 */
export const getDocumentById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase() || 'STUDENT';
    const { documentId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
    }

    const document = await documentQueries.getDocumentById(documentId, userId, userRole);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied'
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      message: 'Document retrieved successfully',
      data: document
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error getting document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve document',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Update document
 * PUT /api/documents/:documentId
 */
export const updateDocument = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { documentId } = req.params;
    const { title, description } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
    }

    const document = await documentQueries.updateDocument(documentId, userId, { title, description });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or not authorized'
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: document
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error updating document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Delete document (soft delete)
 * DELETE /api/documents/:documentId
 */
export const deleteDocument = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { documentId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
    }

    const success = await documentQueries.deleteDocument(documentId, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or not authorized'
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Download document
 * GET /api/documents/:documentId/download
 */
export const downloadDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase() || 'STUDENT';
    const { documentId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    const document = await documentQueries.getDocumentById(documentId, userId, userRole);

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found or access denied'
      } as ApiResponse);
      return;
    }

    // Check download permission for students
    if (userRole === 'STUDENT' && document.permission_type === 'VIEW') {
      res.status(403).json({
        success: false,
        message: 'You only have view permission for this document'
      } as ApiResponse);
      return;
    }

    // Log access
    await documentQueries.createAccessLog({
      document_id: documentId,
      user_id: userId,
      access_type: 'DOWNLOAD',
    });

    // Send file
    const filePath = document.file_path;
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'File not found on server'
      } as ApiResponse);
      return;
    }

    res.download(filePath, document.file_name);
  } catch (error: any) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get document permissions
 * GET /api/documents/:documentId/permissions
 */
export const getDocumentPermissions = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { documentId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
    }

    const permissions = await documentQueries.getDocumentPermissions(documentId, userId);

    return res.status(200).json({
      success: true,
      message: 'Permissions retrieved successfully',
      data: permissions
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error getting permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve permissions',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Grant document permission
 * POST /api/documents/:documentId/permissions
 */
export const grantPermission = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { documentId } = req.params;
    const { studentId, permissionType } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
    }

    if (!studentId || !permissionType) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and permission type are required'
      } as ApiResponse);
    }

    const permission = await documentQueries.grantPermission({
      document_id: documentId,
      user_id: studentId,
      granted_by: userId,
      permission_type: permissionType,
    });

    return res.status(201).json({
      success: true,
      message: 'Permission granted successfully',
      data: permission
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error granting permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to grant permission',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Revoke document permission
 * DELETE /api/documents/:documentId/permissions/:permissionId
 */
export const revokePermission = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { documentId, permissionId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
    }

    const success = await documentQueries.revokePermission(permissionId, documentId, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found or not authorized'
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      message: 'Permission revoked successfully'
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error revoking permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to revoke permission',
      error: error.message
    } as ApiResponse);
  }
};

/**
 * Get tutor's students for sharing documents
 * GET /api/documents/students
 */
export const getTutorStudents = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role?.toUpperCase();

    if (!userId || userRole !== 'TUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can access this'
      } as ApiResponse);
    }

    const students = await documentQueries.getTutorStudents(userId);

    return res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: students
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error getting students:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students',
      error: error.message
    } as ApiResponse);
  }
};
