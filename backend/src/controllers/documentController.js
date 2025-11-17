/**
 * File: documentController.js
 * Mục đích: Controller functions cho Document APIs
 * Vai trò:
 *   - Handle business logic cho document management
 *   - Tương tác với database thông qua queries
 *   - Format response data
 * Lưu ý:
 *   - Sử dụng responseFormatter cho consistent response format
 *   - Validate input data trước khi process
 *   - Handle errors appropriately
 */

const responseFormatter = require('../utils/responseFormatter');
const {
  getTutorDocuments,
  getStudentDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  grantDocumentPermission,
  revokeDocumentPermission,
  getDocumentPermissions,
  getTutorStudents,
  logDocumentAccess
} = require('../models/queries/documentQueries');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get documents for current user
 * - If user is TUTOR: return their own documents
 * - If user is USER (student): return documents they have access to
 */
const getMyDocuments = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.user_id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'User information missing'
      });
    }

    let documents;
    if (userRole === 'TUTOR') {
      documents = await getTutorDocuments(userId);
    } else {
      documents = await getStudentDocuments(userId);
    }

    res.json({
      success: true,
      data: documents,
      message: 'Lấy danh sách tài liệu thành công'
    });
  } catch (error) {
    console.error('Error in getMyDocuments:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách tài liệu',
      error: error.message
    });
  }
};

/**
 * Upload a new document
 */
const uploadDocument = async (req, res) => {
  try {
    const tutorId = req.user?.userId || req.user?.user_id;
    const userRole = req.user?.role;

    if (!tutorId || userRole !== 'TUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'Only tutors can upload documents'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        error: 'File is required'
      });
    }

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: 'Title is required'
      });
    }

    // Create document record
    const documentData = {
      tutorId,
      title,
      description: description || '',
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileUrl: null, // For now, using local file path
      fileType: req.file.mimetype,
      fileSize: req.file.size
    };

    const document = await createDocument(documentData);

    res.status(201).json({
      success: true,
      data: document,
      message: 'Tài liệu đã được tải lên thành công'
    });
  } catch (error) {
    console.error('Error in uploadDocument:', error);

    // Clean up uploaded file if database operation failed
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Không thể tải lên tài liệu',
      error: error.message
    });
  }
};

/**
 * Get document details
 */
const getDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId || req.user?.user_id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID format'
      });
    }

    const document = await getDocumentById(documentId, userId, userRole);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
        error: 'Document does not exist or access denied'
      });
    }

    res.json({
      success: true,
      data: document,
      message: 'Lấy thông tin tài liệu thành công'
    });
  } catch (error) {
    console.error('Error in getDocument:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin tài liệu',
      error: error.message
    });
  }
};

/**
 * Update document
 */
const updateDocumentInfo = async (req, res) => {
  try {
    const { documentId } = req.params;
    const tutorId = req.user?.userId || req.user?.user_id;
    const userRole = req.user?.role;
    const { title, description } = req.body;

    if (!tutorId || userRole !== 'TUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'Only tutors can update documents'
      });
    }

    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID format'
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: 'Title is required'
      });
    }

    const document = await updateDocument(documentId, tutorId, { title, description });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
        error: 'Document does not exist or access denied'
      });
    }

    res.json({
      success: true,
      data: document,
      message: 'Cập nhật tài liệu thành công'
    });
  } catch (error) {
    console.error('Error in updateDocumentInfo:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật tài liệu',
      error: error.message
    });
  }
};

/**
 * Delete document
 */
const deleteDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params;
    const tutorId = req.user?.userId || req.user?.user_id;
    const userRole = req.user?.role;

    if (!tutorId || userRole !== 'TUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'Only tutors can delete documents'
      });
    }

    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID format'
      });
    }

    // Get document info first to delete file
    const document = await getDocumentById(documentId, tutorId, userRole);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Soft delete from database
    const deleted = await deleteDocument(documentId, tutorId);

    if (deleted) {
      // Try to delete physical file
      try {
        if (document.file_path && document.file_path.startsWith('uploads/')) {
          await fs.unlink(path.join(__dirname, '../../', document.file_path));
        }
      } catch (fileError) {
        console.warn('Could not delete physical file:', fileError.message);
      }

      res.json({
        success: true,
        message: 'Xóa tài liệu thành công'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
  } catch (error) {
    console.error('Error in deleteDocumentById:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa tài liệu',
      error: error.message
    });
  }
};

/**
 * Download document
 */
const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId || req.user?.user_id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID format'
      });
    }

    const document = await getDocumentById(documentId, userId, userRole);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user has download permission
    if (userRole !== 'TUTOR') {
      if (!document.permission_type || !['DOWNLOAD', 'EDIT'].includes(document.permission_type)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          error: 'You do not have download permission for this document'
        });
      }
    }

    // Check if file exists
    const filePath = path.join(__dirname, '../../', document.file_path);
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
        error: 'The document file is missing'
      });
    }

    // Log access
    try {
      await logDocumentAccess(
        documentId,
        userId,
        'DOWNLOAD',
        req.ip,
        req.get('User-Agent')
      );
    } catch (logError) {
      console.warn('Could not log document access:', logError.message);
    }

    // Send file
    res.download(filePath, document.file_name);
  } catch (error) {
    console.error('Error in downloadDocument:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải xuống tài liệu',
      error: error.message
    });
  }
};

/**
 * Grant permission to student
 */
const grantPermission = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { studentId, permissionType } = req.body;
    const tutorId = req.user?.userId || req.user?.user_id;
    const userRole = req.user?.role;

    if (!tutorId || userRole !== 'TUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'Only tutors can grant permissions'
      });
    }

    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID format'
      });
    }

    if (!studentId || !permissionType) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: 'studentId and permissionType are required'
      });
    }

    if (!['VIEW', 'DOWNLOAD', 'EDIT'].includes(permissionType)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: 'Invalid permission type'
      });
    }

    const permission = await grantDocumentPermission(documentId, tutorId, studentId, permissionType);

    res.json({
      success: true,
      data: permission,
      message: 'Cấp quyền truy cập thành công'
    });
  } catch (error) {
    console.error('Error in grantPermission:', error);

    if (error.message === 'Document not found or access denied') {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
        error: 'Document does not exist or you do not own it'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Không thể cấp quyền truy cập',
      error: error.message
    });
  }
};

/**
 * Revoke permission from student
 */
const revokePermission = async (req, res) => {
  try {
    const { documentId, studentId } = req.params;
    const tutorId = req.user?.userId || req.user?.user_id;
    const userRole = req.user?.role;

    if (!tutorId || userRole !== 'TUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'Only tutors can revoke permissions'
      });
    }

    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID format'
      });
    }

    const revoked = await revokeDocumentPermission(documentId, tutorId, studentId);

    if (revoked) {
      res.json({
        success: true,
        message: 'Thu hồi quyền truy cập thành công'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
  } catch (error) {
    console.error('Error in revokePermission:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thu hồi quyền truy cập',
      error: error.message
    });
  }
};

/**
 * Get document permissions
 */
const getPermissions = async (req, res) => {
  try {
    const { documentId } = req.params;
    const tutorId = req.user?.userId || req.user?.user_id;
    const userRole = req.user?.role;

    if (!tutorId || userRole !== 'TUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'Only tutors can view permissions'
      });
    }

    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID format'
      });
    }

    const permissions = await getDocumentPermissions(documentId, tutorId);

    res.json({
      success: true,
      data: permissions,
      message: 'Lấy danh sách quyền truy cập thành công'
    });
  } catch (error) {
    console.error('Error in getPermissions:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách quyền truy cập',
      error: error.message
    });
  }
};

/**
 * Get tutor's students for permission granting
 */
const getStudents = async (req, res) => {
  try {
    const tutorId = req.user?.userId || req.user?.user_id;
    const userRole = req.user?.role;

    if (!tutorId || userRole !== 'TUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'Only tutors can view students'
      });
    }

    const students = await getTutorStudents(tutorId);

    res.json({
      success: true,
      data: students,
      message: 'Lấy danh sách học sinh thành công'
    });
  } catch (error) {
    console.error('Error in getStudents:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách học sinh',
      error: error.message
    });
  }
};

module.exports = {
  getMyDocuments,
  uploadDocument,
  getDocument,
  updateDocumentInfo,
  deleteDocumentById,
  downloadDocument,
  grantPermission,
  revokePermission,
  getPermissions,
  getStudents
};
