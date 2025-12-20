/**
 * File: documentQueries.js
 * Mục đích: Database queries cho Document operations
 * Vai trò:
 *   - Định nghĩa SQL queries cho document management
 *   - Handle database interactions for documents and permissions
 * Lưu ý:
 *   - Sử dụng parameterized queries để tránh SQL injection
 *   - Return consistent data format
 *   - Handle database errors appropriately
 */

const sql = require('mssql');

// Try to use shared dbConnection if available, otherwise create local config
let dbConnection;
try {
  dbConnection = require('../../database/connection');
} catch (e) {
  console.log('dbConnection not available, will create local connection');
  dbConnection = null;
}

/**
 * Get all documents owned by a tutor
 */
const getTutorDocuments = async (tutorId) => {
  let pool;
  try {
    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb0_2',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    const query = `
      SELECT
        d.document_id,
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
        -- Count of students with access
        COUNT(dp.permission_id) as shared_count
      FROM [Documents] d
      LEFT JOIN [DocumentPermissions] dp ON d.document_id = dp.document_id AND dp.status = 'ACTIVE'
      WHERE d.tutor_id = @tutorId AND d.status = 'ACTIVE'
      GROUP BY d.document_id, d.title, d.description, d.file_name, d.file_path, d.file_url,
               d.file_type, d.file_size, d.upload_date, d.status, d.created_at, d.updated_at
      ORDER BY d.upload_date DESC
    `;

    const result = await pool.request()
      .input('tutorId', sql.UniqueIdentifier, tutorId)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error('Error in getTutorDocuments:', error);
    throw error;
  } finally {
    if (pool && !dbConnection) {
      await pool.close();
    }
  }
};

/**
 * Get documents accessible to a student
 */
const getStudentDocuments = async (studentId) => {
  let pool;
  try {
    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb0_2',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    const query = `
      SELECT
        d.document_id,
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
        u.name as tutor_name,
        u.email as tutor_email
      FROM [DocumentPermissions] dp
      JOIN [Documents] d ON dp.document_id = d.document_id
      JOIN [UserAccount] u ON d.tutor_id = u.user_id
      WHERE dp.user_id = @studentId
        AND dp.status = 'ACTIVE'
        AND d.status = 'ACTIVE'
      ORDER BY dp.granted_date DESC
    `;

    const result = await pool.request()
      .input('studentId', sql.UniqueIdentifier, studentId)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error('Error in getStudentDocuments:', error);
    throw error;
  } finally {
    if (pool && !dbConnection) {
      await pool.close();
    }
  }
};

/**
 * Create a new document
 */
const createDocument = async (documentData) => {
  let pool;
  try {
    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb0_2',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    const query = `
      INSERT INTO [Documents] (
        tutor_id, title, description, file_name, file_path, file_url,
        file_type, file_size, status
      )
      OUTPUT INSERTED.document_id, INSERTED.tutor_id, INSERTED.title, INSERTED.description,
             INSERTED.file_name, INSERTED.file_path, INSERTED.file_url, INSERTED.file_type,
             INSERTED.file_size, INSERTED.upload_date, INSERTED.status, INSERTED.created_at
      VALUES (
        @tutorId, @title, @description, @fileName, @filePath, @fileUrl,
        @fileType, @fileSize, @status
      )
    `;

    const result = await pool.request()
      .input('tutorId', sql.UniqueIdentifier, documentData.tutorId)
      .input('title', sql.NVarChar, documentData.title)
      .input('description', sql.NVarChar, documentData.description || null)
      .input('fileName', sql.NVarChar, documentData.fileName)
      .input('filePath', sql.NVarChar, documentData.filePath)
      .input('fileUrl', sql.NVarChar, documentData.fileUrl || null)
      .input('fileType', sql.VarChar, documentData.fileType)
      .input('fileSize', sql.BigInt, documentData.fileSize)
      .input('status', sql.VarChar, documentData.status || 'ACTIVE')
      .query(query);

    // Add shared_count field (initially 0 for new documents)
    const document = result.recordset[0];
    document.shared_count = 0;
    
    // Ensure proper data types
    if (document.file_size) {
      document.file_size = parseInt(document.file_size.toString());
    }
    
    return document;
  } catch (error) {
    console.error('Error in createDocument:', error);
    throw error;
  } finally {
    if (pool && !dbConnection) {
      await pool.close();
    }
  }
};

/**
 * Get document by ID (with ownership check)
 */
const getDocumentById = async (documentId, userId, userRole) => {
  let pool;
  try {
    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      console.error('Invalid documentId provided:', documentId);
      return null;
    }

    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb0_2',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    let query;
    let request = pool.request()
      .input('documentId', sql.UniqueIdentifier, documentId);

    if (userRole === 'tutor') {
      // Tutors can see their own documents
      query = `
        SELECT d.*, u.name as tutor_name, u.email as tutor_email
        FROM [Documents] d
        JOIN [UserAccount] u ON d.tutor_id = u.user_id
        WHERE d.document_id = @documentId AND d.tutor_id = @userId
      `;
      request.input('userId', sql.UniqueIdentifier, userId);
    } else {
      // Students can only see documents they have permission for
      query = `
        SELECT d.*, dp.permission_type, u.name as tutor_name, u.email as tutor_email
        FROM [Documents] d
        JOIN [DocumentPermissions] dp ON d.document_id = dp.document_id
        JOIN [UserAccount] u ON d.tutor_id = u.user_id
        WHERE d.document_id = @documentId
          AND dp.user_id = @userId
          AND dp.status = 'ACTIVE'
          AND d.status = 'ACTIVE'
      `;
      request.input('userId', sql.UniqueIdentifier, userId);
    }

    const result = await request.query(query);
    return result.recordset[0];
  } catch (error) {
    console.error('Error in getDocumentById:', error);
    throw error;
  } finally {
    if (pool && !dbConnection) {
      await pool.close();
    }
  }
};

/**
 * Update document
 */
const updateDocument = async (documentId, tutorId, updateData) => {
  let pool;
  try {
    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      throw new Error('Invalid document ID format');
    }

    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb0_2',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    const query = `
      UPDATE [Documents]
      SET title = @title,
          description = @description,
          updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE document_id = @documentId AND tutor_id = @tutorId
    `;

    const result = await pool.request()
      .input('documentId', sql.UniqueIdentifier, documentId)
      .input('tutorId', sql.UniqueIdentifier, tutorId)
      .input('title', sql.NVarChar, updateData.title)
      .input('description', sql.NVarChar, updateData.description || null)
      .query(query);

    return result.recordset[0];
  } catch (error) {
    console.error('Error in updateDocument:', error);
    throw error;
  } finally {
    if (pool && !dbConnection) {
      await pool.close();
    }
  }
};

/**
 * Delete document (soft delete)
 */
const deleteDocument = async (documentId, tutorId) => {
  let pool;
  try {
    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      throw new Error('Invalid document ID format');
    }

    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb0_2',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    const query = `
      UPDATE [Documents]
      SET status = 'DELETED', updated_at = GETDATE()
      WHERE document_id = @documentId AND tutor_id = @tutorId
    `;

    const result = await pool.request()
      .input('documentId', sql.UniqueIdentifier, documentId)
      .input('tutorId', sql.UniqueIdentifier, tutorId)
      .query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    throw error;
  } finally {
    if (pool && !dbConnection) {
      await pool.close();
    }
  }
};

/**
 * Grant permission to a student
 */
const grantDocumentPermission = async (documentId, tutorId, studentId, permissionType) => {
  let pool;
  try {
    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      throw new Error('Invalid document ID format');
    }

    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb0_2',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    // First check if tutor owns the document
    const ownershipQuery = `
      SELECT document_id FROM [Documents]
      WHERE document_id = @documentId AND tutor_id = @tutorId AND status = 'ACTIVE'
    `;

    const ownershipResult = await pool.request()
      .input('documentId', sql.UniqueIdentifier, documentId)
      .input('tutorId', sql.UniqueIdentifier, tutorId)
      .query(ownershipQuery);

    if (ownershipResult.recordset.length === 0) {
      throw new Error('Document not found or access denied');
    }

    // Check if permission already exists
    const existingQuery = `
      SELECT permission_id, status FROM [DocumentPermissions]
      WHERE document_id = @documentId AND user_id = @studentId
    `;

    const existingResult = await pool.request()
      .input('documentId', sql.UniqueIdentifier, documentId)
      .input('studentId', sql.UniqueIdentifier, studentId)
      .query(existingQuery);

    if (existingResult.recordset.length > 0) {
      const existing = existingResult.recordset[0];
      if (existing.status === 'ACTIVE') {
        // Update existing permission
        const updateQuery = `
          UPDATE [DocumentPermissions]
          SET permission_type = @permissionType, updated_at = GETDATE()
          OUTPUT INSERTED.*
          WHERE permission_id = @permissionId
        `;
        const updateResult = await pool.request()
          .input('permissionId', sql.UniqueIdentifier, existing.permission_id)
          .input('permissionType', sql.VarChar, permissionType)
          .query(updateQuery);
        return updateResult.recordset[0];
      } else {
        // Reactivate revoked permission
        const reactivateQuery = `
          UPDATE [DocumentPermissions]
          SET status = 'ACTIVE', permission_type = @permissionType,
              granted_date = GETDATE(), updated_at = GETDATE()
          OUTPUT INSERTED.*
          WHERE permission_id = @permissionId
        `;
        const reactivateResult = await pool.request()
          .input('permissionId', sql.UniqueIdentifier, existing.permission_id)
          .input('permissionType', sql.VarChar, permissionType)
          .query(reactivateQuery);
        return reactivateResult.recordset[0];
      }
    } else {
      // Create new permission
      const insertQuery = `
        INSERT INTO [DocumentPermissions] (document_id, user_id, granted_by, permission_type, status)
        OUTPUT INSERTED.*
        VALUES (@documentId, @studentId, @tutorId, @permissionType, 'ACTIVE')
      `;

      const insertResult = await pool.request()
        .input('documentId', sql.UniqueIdentifier, documentId)
        .input('studentId', sql.UniqueIdentifier, studentId)
        .input('tutorId', sql.UniqueIdentifier, tutorId)
        .input('permissionType', sql.VarChar, permissionType)
        .query(insertQuery);

      return insertResult.recordset[0];
    }
  } catch (error) {
    console.error('Error in grantDocumentPermission:', error);
    throw error;
  } finally {
    if (pool && !dbConnection) {
      await pool.close();
    }
  }
};

/**
 * Revoke document permission
 */
const revokeDocumentPermission = async (documentId, tutorId, studentId) => {
  let pool;
  try {
    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      throw new Error('Invalid document ID format');
    }

    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb0_2',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    const query = `
      UPDATE [DocumentPermissions]
      SET status = 'REVOKED', revoked_date = GETDATE(), updated_at = GETDATE()
      WHERE document_id = @documentId AND user_id = @studentId AND granted_by = @tutorId
    `;

    const result = await pool.request()
      .input('documentId', sql.UniqueIdentifier, documentId)
      .input('studentId', sql.UniqueIdentifier, studentId)
      .input('tutorId', sql.UniqueIdentifier, tutorId)
      .query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Error in revokeDocumentPermission:', error);
    throw error;
  } finally {
    if (pool && !dbConnection) {
      await pool.close();
    }
  }
};

/**
 * Get students who have access to a document
 */
const getDocumentPermissions = async (documentId, tutorId) => {
  let pool;
  try {
    // Validate documentId is a valid GUID
    if (!documentId || typeof documentId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      console.error('Invalid documentId provided to getDocumentPermissions:', documentId);
      return [];
    }

    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb0_2',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    const query = `
      SELECT
        dp.permission_id,
        dp.permission_type,
        dp.granted_date,
        dp.status,
        u.user_id,
        u.name,
        u.email
      FROM [DocumentPermissions] dp
      JOIN [UserAccount] u ON dp.user_id = u.user_id
      JOIN [Documents] d ON dp.document_id = d.document_id
      WHERE dp.document_id = @documentId AND d.tutor_id = @tutorId
      ORDER BY dp.granted_date DESC
    `;

    const result = await pool.request()
      .input('documentId', sql.UniqueIdentifier, documentId)
      .input('tutorId', sql.UniqueIdentifier, tutorId)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error('Error in getDocumentPermissions:', error);
    throw error;
  } finally {
    if (pool && !dbConnection) {
      await pool.close();
    }
  }
};

/**
 * Get students list for a tutor (for permission granting)
 */
const getTutorStudents = async (tutorId) => {
  let pool;
  try {
    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb0_2',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    // Insert sample data for testing
    try {
      // Check if sample data exists
      const existingData = await pool.request().query(`
        SELECT COUNT(*) as count FROM Class
        WHERE tutor_id = 'AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
      `);

      if (existingData.recordset[0].count === 0) {
        console.log('Inserting sample class data...');

        // Get student ID
        const studentResult = await pool.request().query(`
          SELECT user_id FROM UserAccount
          WHERE email = 'student1@example.com' AND role = 'USER'
        `);

        if (studentResult.recordset.length > 0) {
          const studentId = studentResult.recordset[0].user_id;

          await pool.request()
            .input('classId', sql.UniqueIdentifier, 'CCCC1111-CCCC-CCCC-CCCC-CCCCCCCCCCCC')
            .input('name', sql.NVarChar, 'Toán cao cấp')
            .input('tutorId', sql.UniqueIdentifier, 'AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA')
            .input('userId', sql.UniqueIdentifier, studentId)
            .query(`
              INSERT INTO Class (class_id, name, tutor_id, user_id, status, created_at)
              VALUES (@classId, @name, @tutorId, @userId, 'active', GETDATE())
            `);

          console.log('Sample class data inserted');
        }
      }
    } catch (insertError) {
      console.warn('Could not insert sample data:', insertError.message);
    }

    const query = `
      SELECT DISTINCT
        u.user_id,
        u.name,
        u.email,
        c.class_id,
        c.name as class_name
      FROM [UserAccount] u
      INNER JOIN [Class] c ON c.user_id = u.user_id
      WHERE c.tutor_id = @tutorId AND u.role = 'USER'
      ORDER BY u.name
    `;

    const result = await pool.request()
      .input('tutorId', sql.UniqueIdentifier, tutorId)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error('Error in getTutorStudents:', error);
    throw error;
  } finally {
    if (pool && !dbConnection) {
      await pool.close();
    }
  }
};

/**
 * Log document access
 */
const logDocumentAccess = async (documentId, userId, accessType, ipAddress, userAgent) => {
  let pool;
  try {
    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb0_2',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    const query = `
      INSERT INTO [DocumentAccessLogs] (document_id, user_id, access_type, ip_address, user_agent)
      VALUES (@documentId, @userId, @accessType, @ipAddress, @userAgent)
    `;

    await pool.request()
      .input('documentId', sql.UniqueIdentifier, documentId)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('accessType', sql.VarChar, accessType)
      .input('ipAddress', sql.VarChar, ipAddress || null)
      .input('userAgent', sql.NVarChar, userAgent || null)
      .query(query);
  } catch (error) {
    console.error('Error in logDocumentAccess:', error);
    throw error;
  } finally {
    if (pool && !dbConnection) {
      await pool.close();
    }
  }
};

module.exports = {
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
};
