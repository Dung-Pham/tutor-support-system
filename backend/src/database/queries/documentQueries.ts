/**
 * File: database/queries/documentQueries.ts
 * Purpose: Database queries for Documents management
 * Schema: Documents, DocumentPermissions, DocumentAccessLogs
 * Note: UserAccount schema mới - status là BIT, không phải VARCHAR
 */

import dbConnection from '../connection';

// ============================================================
// INTERFACES
// ============================================================

export interface Document {
  document_id: string;
  tutor_id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  upload_date: Date;
  status: string; // 'ACTIVE', 'DELETED', 'ARCHIVED'
  created_at: Date;
  updated_at?: Date;
  // Joined fields
  tutor_name?: string;
  tutor_email?: string;
  shared_count?: number;
  permission_type?: string; // For student view
}

export interface DocumentPermission {
  permission_id: string;
  document_id: string;
  user_id: string; // Student ID
  granted_by: string; // Tutor ID
  permission_type: string; // 'VIEW', 'DOWNLOAD', 'EDIT'
  granted_date: Date;
  revoked_date?: Date;
  status: string; // 'ACTIVE', 'REVOKED', 'EXPIRED'
  created_at: Date;
  updated_at?: Date;
  // Joined fields
  user_name?: string;
  user_email?: string;
}

export interface DocumentAccessLog {
  log_id: string;
  document_id: string;
  user_id: string;
  access_type: string; // 'VIEW', 'DOWNLOAD', 'PREVIEW'
  access_time: Date;
  ip_address?: string;
  user_agent?: string;
}

export interface CreateDocumentDTO {
  tutor_id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
}

export interface UpdateDocumentDTO {
  title?: string;
  description?: string;
}

// ============================================================
// DOCUMENT QUERIES
// ============================================================

/**
 * Get all documents owned by a tutor
 */
export const getTutorDocuments = async (tutorId: string): Promise<Document[]> => {
  const query = `
    SELECT 
      d.document_id,
      d.tutor_id,
      d.title,
      d.description,
      d.file_name,
      d.file_path,
      d.file_url,
      d.file_type,
      d.file_size,
      d.upload_date,
      d.status,
      d.created_at,
      d.updated_at,
      COUNT(dp.permission_id) as shared_count
    FROM [Documents] d
    LEFT JOIN [DocumentPermissions] dp ON d.document_id = dp.document_id AND dp.status = 'ACTIVE'
    WHERE d.tutor_id = @tutorId AND d.status = 'ACTIVE'
    GROUP BY d.document_id, d.tutor_id, d.title, d.description, d.file_name, d.file_path, 
             d.file_url, d.file_type, d.file_size, d.upload_date, d.status, d.created_at, d.updated_at
    ORDER BY d.upload_date DESC
  `;

  const result = await dbConnection.query<Document>(query, { tutorId });
  return result.recordset;
};

/**
 * Get documents accessible to a student (via permissions)
 */
export const getStudentDocuments = async (studentId: string): Promise<Document[]> => {
  const query = `
    SELECT 
      d.document_id,
      d.tutor_id,
      d.title,
      d.description,
      d.file_name,
      d.file_path,
      d.file_url,
      d.file_type,
      d.file_size,
      d.upload_date,
      dp.permission_type,
      dp.granted_date,
      u.[name] as tutor_name,
      u.email as tutor_email
    FROM [DocumentPermissions] dp
    INNER JOIN [Documents] d ON dp.document_id = d.document_id
    INNER JOIN [UserAccount] u ON d.tutor_id = u.user_id
    WHERE dp.user_id = @studentId
      AND dp.status = 'ACTIVE'
      AND d.status = 'ACTIVE'
    ORDER BY dp.granted_date DESC
  `;

  const result = await dbConnection.query<Document>(query, { studentId });
  return result.recordset;
};

/**
 * Create a new document
 */
export const createDocument = async (data: CreateDocumentDTO): Promise<Document> => {
  const query = `
    INSERT INTO [Documents] (
      tutor_id, title, description, file_name, file_path, 
      file_url, file_type, file_size, status
    )
    OUTPUT INSERTED.*
    VALUES (
      @tutor_id, @title, @description, @file_name, @file_path,
      @file_url, @file_type, @file_size, 'ACTIVE'
    )
  `;

  const result = await dbConnection.query<Document>(query, {
    tutor_id: data.tutor_id,
    title: data.title,
    description: data.description || null,
    file_name: data.file_name,
    file_path: data.file_path,
    file_url: data.file_url || null,
    file_type: data.file_type || null,
    file_size: data.file_size || null,
  });

  return result.recordset[0];
};

/**
 * Get document by ID (with ownership check)
 */
export const getDocumentById = async (
  documentId: string,
  userId: string,
  userRole: string
): Promise<Document | null> => {
  let query: string;

  if (userRole === 'TUTOR') {
    // Tutors can see their own documents
    query = `
      SELECT d.*, u.[name] as tutor_name, u.email as tutor_email
      FROM [Documents] d
      INNER JOIN [UserAccount] u ON d.tutor_id = u.user_id
      WHERE d.document_id = @documentId AND d.tutor_id = @userId
    `;
  } else {
    // Students can only see documents they have permission for
    query = `
      SELECT d.*, dp.permission_type, u.[name] as tutor_name, u.email as tutor_email
      FROM [Documents] d
      INNER JOIN [DocumentPermissions] dp ON d.document_id = dp.document_id
      INNER JOIN [UserAccount] u ON d.tutor_id = u.user_id
      WHERE d.document_id = @documentId
        AND dp.user_id = @userId
        AND dp.status = 'ACTIVE'
        AND d.status = 'ACTIVE'
    `;
  }

  const result = await dbConnection.query<Document>(query, { documentId, userId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get document by ID (no access check - for internal use)
 */
export const getDocumentByIdInternal = async (documentId: string): Promise<Document | null> => {
  const query = `
    SELECT d.*, u.[name] as tutor_name, u.email as tutor_email
    FROM [Documents] d
    INNER JOIN [UserAccount] u ON d.tutor_id = u.user_id
    WHERE d.document_id = @documentId
  `;

  const result = await dbConnection.query<Document>(query, { documentId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Update document
 */
export const updateDocument = async (
  documentId: string,
  tutorId: string,
  data: UpdateDocumentDTO
): Promise<Document | null> => {
  const updateFields: string[] = ['updated_at = GETDATE()'];
  const params: Record<string, any> = { documentId, tutorId };

  if (data.title !== undefined) {
    updateFields.push('title = @title');
    params.title = data.title;
  }

  if (data.description !== undefined) {
    updateFields.push('description = @description');
    params.description = data.description;
  }

  const query = `
    UPDATE [Documents]
    SET ${updateFields.join(', ')}
    OUTPUT INSERTED.*
    WHERE document_id = @documentId AND tutor_id = @tutorId
  `;

  const result = await dbConnection.query<Document>(query, params);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Delete document (soft delete)
 */
export const deleteDocument = async (documentId: string, tutorId: string): Promise<boolean> => {
  const query = `
    UPDATE [Documents]
    SET status = 'DELETED', updated_at = GETDATE()
    WHERE document_id = @documentId AND tutor_id = @tutorId
  `;

  const result = await dbConnection.query(query, { documentId, tutorId });
  return result.rowsAffected[0] > 0;
};

/**
 * Hard delete document
 */
export const hardDeleteDocument = async (documentId: string, tutorId: string): Promise<boolean> => {
  const query = `
    DELETE FROM [Documents]
    WHERE document_id = @documentId AND tutor_id = @tutorId
  `;

  const result = await dbConnection.query(query, { documentId, tutorId });
  return result.rowsAffected[0] > 0;
};

// ============================================================
// PERMISSION QUERIES
// ============================================================

/**
 * Grant document permission to a student
 */
export const grantDocumentPermission = async (
  documentId: string,
  tutorId: string,
  studentId: string,
  permissionType: string = 'VIEW'
): Promise<DocumentPermission> => {
  // First verify tutor owns the document
  const ownershipQuery = `
    SELECT document_id FROM [Documents]
    WHERE document_id = @documentId AND tutor_id = @tutorId AND status = 'ACTIVE'
  `;

  const ownershipResult = await dbConnection.query<{ document_id: string }>(ownershipQuery, {
    documentId,
    tutorId,
  });

  if (ownershipResult.recordset.length === 0) {
    throw new Error('Document not found or access denied');
  }

  // Check if permission already exists
  const existingQuery = `
    SELECT permission_id, status FROM [DocumentPermissions]
    WHERE document_id = @documentId AND user_id = @studentId
  `;

  const existingResult = await dbConnection.query<{ permission_id: string; status: string }>(
    existingQuery,
    { documentId, studentId }
  );

  if (existingResult.recordset.length > 0) {
    const existing = existingResult.recordset[0];

    // Update existing permission
    const updateQuery = `
      UPDATE [DocumentPermissions]
      SET permission_type = @permissionType, 
          status = 'ACTIVE',
          granted_date = CASE WHEN status != 'ACTIVE' THEN GETDATE() ELSE granted_date END,
          revoked_date = NULL,
          updated_at = GETDATE()
      WHERE permission_id = @permissionId
    `;

    await dbConnection.query<DocumentPermission>(updateQuery, {
      permissionId: existing.permission_id,
      permissionType,
    });
  } else {
    // Create new permission
    const insertQuery = `
      INSERT INTO [DocumentPermissions] (document_id, user_id, granted_by, permission_type, status)
      VALUES (@documentId, @studentId, @tutorId, @permissionType, 'ACTIVE')
    `;

    await dbConnection.query<DocumentPermission>(insertQuery, {
      documentId,
      studentId,
      tutorId,
      permissionType,
    });
  }

  // Query return permission with full info
  const selectQuery = `
    SELECT 
      dp.permission_id,
      dp.document_id,
      dp.user_id,
      dp.granted_by,
      dp.permission_type,
      dp.granted_date,
      dp.revoked_date,
      dp.status,
      dp.created_at,
      dp.updated_at,
      u.[name] as user_name,
      u.email as user_email,
      c.description as class_name,
      c.class_id
    FROM [DocumentPermissions] dp
    INNER JOIN [UserAccount] u ON dp.user_id = u.user_id
    LEFT JOIN [Class] c ON c.student_id = u.user_id AND c.tutor_id = @tutorId
    WHERE dp.document_id = @documentId AND dp.user_id = @studentId
  `;

  const selectResult = await dbConnection.query<DocumentPermission>(selectQuery, {
    documentId,
    studentId,
    tutorId,
  });

  return selectResult.recordset[0];
};

/**
 * Revoke document permission
 */
export const revokeDocumentPermission = async (
  documentId: string,
  tutorId: string,
  studentId: string
): Promise<boolean> => {
  const query = `
    UPDATE [DocumentPermissions]
    SET status = 'REVOKED', revoked_date = GETDATE(), updated_at = GETDATE()
    WHERE document_id = @documentId AND user_id = @studentId AND granted_by = @tutorId
  `;

  const result = await dbConnection.query(query, { documentId, studentId, tutorId });
  return result.rowsAffected[0] > 0;
};

/**
 * Get students who have access to a document
 */
export const getDocumentPermissions = async (
  documentId: string,
  tutorId: string
): Promise<DocumentPermission[]> => {
  const query = `
    SELECT 
      dp.permission_id,
      dp.document_id,
      dp.user_id,
      dp.granted_by,
      dp.permission_type,
      dp.granted_date,
      dp.revoked_date,
      dp.status,
      dp.created_at,
      dp.updated_at,
      u.[name] as user_name,
      u.email as user_email,
      c.description as class_name,
      c.class_id
    FROM [DocumentPermissions] dp
    INNER JOIN [UserAccount] u ON dp.user_id = u.user_id
    INNER JOIN [Documents] d ON dp.document_id = d.document_id
    LEFT JOIN [Class] c ON c.student_id = u.user_id AND c.tutor_id = @tutorId
    WHERE dp.document_id = @documentId AND d.tutor_id = @tutorId
    ORDER BY dp.granted_date DESC
  `;

  const result = await dbConnection.query<DocumentPermission>(query, { documentId, tutorId });
  return result.recordset;
};

/**
 * Check if user has permission for document
 */
export const checkDocumentPermission = async (
  documentId: string,
  userId: string,
  requiredPermission?: string
): Promise<boolean> => {
  let query = `
    SELECT 1 as has_access
    FROM [DocumentPermissions]
    WHERE document_id = @documentId 
      AND user_id = @userId 
      AND status = 'ACTIVE'
  `;

  if (requiredPermission) {
    // Check specific permission level
    const permissionLevels: Record<string, string[]> = {
      VIEW: ['VIEW', 'DOWNLOAD', 'EDIT'],
      DOWNLOAD: ['DOWNLOAD', 'EDIT'],
      EDIT: ['EDIT'],
    };

    const allowedTypes = permissionLevels[requiredPermission] || [requiredPermission];
    query += ` AND permission_type IN ('${allowedTypes.join("','")}')`;
  }

  const result = await dbConnection.query<{ has_access: number }>(query, { documentId, userId });
  return result.recordset.length > 0;
};

// ============================================================
// STUDENT QUERIES (for permission granting)
// ============================================================

/**
 * Get students list for a tutor (students in their classes)
 * Note: Class schema mới có student_id thay vì user_id
 */
export const getTutorStudents = async (
  tutorId: string
): Promise<{ user_id: string; name: string; email: string; class_id: string; class_name: string }[]> => {
  const query = `
    SELECT DISTINCT
      u.user_id,
      u.[name],
      u.email,
      c.class_id,
      c.description as class_name
    FROM [UserAccount] u
    INNER JOIN [Class] c ON c.student_id = u.user_id
    WHERE c.tutor_id = @tutorId 
      AND UPPER(u.role) = 'STUDENT'
      AND u.status = 1  -- UserAccount.status is now BIT (1 = active)
    ORDER BY u.[name]
  `;

  const result = await dbConnection.query<{
    user_id: string;
    name: string;
    email: string;
    class_id: string;
    class_name: string;
  }>(query, { tutorId });

  return result.recordset;
};

// ============================================================
// ACCESS LOG QUERIES
// ============================================================

/**
 * Log document access
 */
export const logDocumentAccess = async (
  documentId: string,
  userId: string,
  accessType: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  const query = `
    INSERT INTO [DocumentAccessLogs] (document_id, user_id, access_type, ip_address, user_agent)
    VALUES (@documentId, @userId, @accessType, @ipAddress, @userAgent)
  `;

  await dbConnection.query(query, {
    documentId,
    userId,
    accessType,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });
};

/**
 * Get document access logs
 */
export const getDocumentAccessLogs = async (
  documentId: string,
  limit: number = 50
): Promise<DocumentAccessLog[]> => {
  const query = `
    SELECT TOP (@limit)
      dal.log_id,
      dal.document_id,
      dal.user_id,
      dal.access_type,
      dal.access_time,
      dal.ip_address,
      dal.user_agent,
      u.[name] as user_name,
      u.email as user_email
    FROM [DocumentAccessLogs] dal
    INNER JOIN [UserAccount] u ON dal.user_id = u.user_id
    WHERE dal.document_id = @documentId
    ORDER BY dal.access_time DESC
  `;

  const result = await dbConnection.query<DocumentAccessLog & { user_name: string; user_email: string }>(
    query,
    { documentId, limit }
  );

  return result.recordset;
};

/**
 * Get access statistics for a document
 */
export const getDocumentAccessStats = async (
  documentId: string
): Promise<{
  total_views: number;
  total_downloads: number;
  unique_users: number;
  last_access: Date | null;
}> => {
  const query = `
    SELECT 
      COUNT(CASE WHEN access_type = 'VIEW' THEN 1 END) as total_views,
      COUNT(CASE WHEN access_type = 'DOWNLOAD' THEN 1 END) as total_downloads,
      COUNT(DISTINCT user_id) as unique_users,
      MAX(access_time) as last_access
    FROM [DocumentAccessLogs]
    WHERE document_id = @documentId
  `;

  const result = await dbConnection.query<{
    total_views: number;
    total_downloads: number;
    unique_users: number;
    last_access: Date | null;
  }>(query, { documentId });

  return result.recordset[0];
};
