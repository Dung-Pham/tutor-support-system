/**
 * File: database/queries/homeworkQueries.ts
 * Purpose: Database queries for Materials and Homework management
 */

import dbConnection from '../connection';
import { Material, Homework, HomeworkSubmission } from '../../types';

/**
 * Upload/Create a material
 * @param data Material data
 * @returns Promise<Material>
 */
export const createMaterial = async (data: {
  tutorId: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}): Promise<Material> => {
  const query = `
    INSERT INTO Material (
      tutorId, title, description, fileUrl, fileType, fileSize,
      uploadDate, createdAt, updatedAt
    )
    OUTPUT INSERTED.*
    VALUES (
      @tutorId, @title, @description, @fileUrl, @fileType, @fileSize,
      GETDATE(), GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<Material>(query, {
    tutorId: data.tutorId,
    title: data.title,
    description: data.description || null,
    fileUrl: data.fileUrl,
    fileType: data.fileType,
    fileSize: data.fileSize,
  });

  return result.recordset[0];
};

/**
 * Get materials by tutor
 * @param tutorId Tutor ID
 * @param limit Limit
 * @param offset Offset
 * @returns Promise<{materials: Material[], total: number}>
 */
export const getMaterialsByTutor = async (
  tutorId: number,
  limit: number = 20,
  offset: number = 0
): Promise<{ materials: Material[]; total: number }> => {
  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM Material
    WHERE tutorId = @tutorId
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, { tutorId });
  const total = countResult.recordset[0].total;

  // Get materials
  const query = `
    SELECT m.*, u.name as tutorName
    FROM Material m
    LEFT JOIN [User] u ON m.tutorId = u.id
    WHERE m.tutorId = @tutorId
    ORDER BY m.uploadDate DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  const result = await dbConnection.query<Material>(query, { tutorId, limit, offset });

  return {
    materials: result.recordset,
    total,
  };
};

/**
 * Create homework assignment
 * @param data Homework data
 * @returns Promise<Homework>
 */
export const createHomework = async (data: {
  scheduleId: number;
  tutorId: number;
  studentId: number;
  title: string;
  description: string;
  dueDate: Date;
  materialId?: number;
}): Promise<Homework> => {
  const query = `
    INSERT INTO Homework (
      scheduleId, tutorId, studentId, title, description,
      dueDate, status, materialId, assignedDate, createdAt, updatedAt
    )
    OUTPUT INSERTED.*
    VALUES (
      @scheduleId, @tutorId, @studentId, @title, @description,
      @dueDate, 'assigned', @materialId, GETDATE(), GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<Homework>(query, {
    scheduleId: data.scheduleId,
    tutorId: data.tutorId,
    studentId: data.studentId,
    title: data.title,
    description: data.description,
    dueDate: data.dueDate,
    materialId: data.materialId || null,
  });

  return result.recordset[0];
};

/**
 * Get homework by ID
 * @param homeworkId Homework ID
 * @returns Promise<Homework | null>
 */
export const getHomeworkById = async (homeworkId: number): Promise<Homework | null> => {
  const query = `
    SELECT h.*,
           u1.name as tutorName,
           u2.name as studentName,
           m.title as materialTitle,
           m.fileUrl as materialUrl
    FROM Homework h
    LEFT JOIN [User] u1 ON h.tutorId = u1.id
    LEFT JOIN [User] u2 ON h.studentId = u2.id
    LEFT JOIN Material m ON h.materialId = m.id
    WHERE h.id = @homeworkId
  `;

  const result = await dbConnection.query<Homework>(query, { homeworkId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get homework list with filters
 * @param filters Query filters
 * @returns Promise<{homework: Homework[], total: number}>
 */
export const getHomework = async (filters: {
  tutorId?: number;
  studentId?: number;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ homework: Homework[]; total: number }> => {
  let whereConditions: string[] = ['1=1'];
  const params: Record<string, any> = {};

  if (filters.tutorId) {
    whereConditions.push('h.tutorId = @tutorId');
    params.tutorId = filters.tutorId;
  }

  if (filters.studentId) {
    whereConditions.push('h.studentId = @studentId');
    params.studentId = filters.studentId;
  }

  if (filters.status) {
    whereConditions.push('h.status = @status');
    params.status = filters.status;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM Homework h
    WHERE ${whereClause}
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, params);
  const total = countResult.recordset[0].total;

  // Get homework
  const query = `
    SELECT h.*,
           u1.name as tutorName,
           u2.name as studentName,
           m.title as materialTitle
    FROM Homework h
    LEFT JOIN [User] u1 ON h.tutorId = u1.id
    LEFT JOIN [User] u2 ON h.studentId = u2.id
    LEFT JOIN Material m ON h.materialId = m.id
    WHERE ${whereClause}
    ORDER BY h.dueDate DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  params.limit = filters.limit || 20;
  params.offset = filters.offset || 0;

  const result = await dbConnection.query<Homework>(query, params);

  return {
    homework: result.recordset,
    total,
  };
};

/**
 * Update homework
 * @param homeworkId Homework ID
 * @param data Update data
 * @returns Promise<Homework>
 */
export const updateHomework = async (
  homeworkId: number,
  data: Partial<{
    title: string;
    description: string;
    dueDate: Date;
    status: string;
  }>
): Promise<Homework> => {
  const updateFields: string[] = [];
  const params: Record<string, any> = { homeworkId };

  if (data.title !== undefined) {
    updateFields.push('title = @title');
    params.title = data.title;
  }

  if (data.description !== undefined) {
    updateFields.push('description = @description');
    params.description = data.description;
  }

  if (data.dueDate !== undefined) {
    updateFields.push('dueDate = @dueDate');
    params.dueDate = data.dueDate;
  }

  if (data.status !== undefined) {
    updateFields.push('status = @status');
    params.status = data.status;
  }

  updateFields.push('updatedAt = GETDATE()');

  const query = `
    UPDATE Homework
    SET ${updateFields.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @homeworkId
  `;

  const result = await dbConnection.query<Homework>(query, params);
  return result.recordset[0];
};

/**
 * Submit homework
 * @param data Submission data
 * @returns Promise<HomeworkSubmission>
 */
export const submitHomework = async (data: {
  homeworkId: number;
  studentId: number;
  submissionText?: string;
  fileUrl?: string;
}): Promise<HomeworkSubmission> => {
  const now = new Date();
  
  // Get homework due date
  const homeworkQuery = `SELECT dueDate FROM Homework WHERE id = @homeworkId`;
  const homeworkResult = await dbConnection.query<{ dueDate: Date }>(homeworkQuery, {
    homeworkId: data.homeworkId,
  });

  const isLate =
    homeworkResult.recordset.length > 0 && now > homeworkResult.recordset[0].dueDate;

  const query = `
    INSERT INTO HomeworkSubmission (
      homeworkId, studentId, submissionText, fileUrl,
      submissionDate, isLate, status, createdAt, updatedAt
    )
    OUTPUT INSERTED.*
    VALUES (
      @homeworkId, @studentId, @submissionText, @fileUrl,
      GETDATE(), @isLate, 'submitted', GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<HomeworkSubmission>(query, {
    homeworkId: data.homeworkId,
    studentId: data.studentId,
    submissionText: data.submissionText || null,
    fileUrl: data.fileUrl || null,
    isLate: isLate ? 1 : 0,
  });

  // Update homework status
  await updateHomework(data.homeworkId, { status: 'submitted' });

  return result.recordset[0];
};

/**
 * Grade homework submission
 * @param submissionId Submission ID
 * @param data Grading data
 * @returns Promise<HomeworkSubmission>
 */
export const gradeSubmission = async (
  submissionId: number,
  data: {
    grade: number;
    feedback?: string;
  }
): Promise<HomeworkSubmission> => {
  const query = `
    UPDATE HomeworkSubmission
    SET grade = @grade,
        feedback = @feedback,
        gradedDate = GETDATE(),
        status = 'graded',
        updatedAt = GETDATE()
    OUTPUT INSERTED.*
    WHERE id = @submissionId
  `;

  const result = await dbConnection.query<HomeworkSubmission>(query, {
    submissionId,
    grade: data.grade,
    feedback: data.feedback || null,
  });

  // Update homework status to graded
  const submission = result.recordset[0];
  await updateHomework(submission.homeworkId, { status: 'graded' });

  return submission;
};

/**
 * Get submissions for homework
 * @param homeworkId Homework ID
 * @returns Promise<HomeworkSubmission[]>
 */
export const getSubmissionsByHomework = async (
  homeworkId: number
): Promise<HomeworkSubmission[]> => {
  const query = `
    SELECT hs.*,
           u.name as studentName
    FROM HomeworkSubmission hs
    LEFT JOIN [User] u ON hs.studentId = u.id
    WHERE hs.homeworkId = @homeworkId
    ORDER BY hs.submissionDate DESC
  `;

  const result = await dbConnection.query<HomeworkSubmission>(query, { homeworkId });
  return result.recordset;
};

/**
 * Get submission by ID
 * @param submissionId Submission ID
 * @returns Promise<HomeworkSubmission | null>
 */
export const getSubmissionById = async (
  submissionId: number
): Promise<HomeworkSubmission | null> => {
  const query = `
    SELECT hs.*,
           u.name as studentName,
           h.title as homeworkTitle
    FROM HomeworkSubmission hs
    LEFT JOIN [User] u ON hs.studentId = u.id
    LEFT JOIN Homework h ON hs.homeworkId = h.id
    WHERE hs.id = @submissionId
  `;

  const result = await dbConnection.query<HomeworkSubmission>(query, { submissionId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Delete material
 * @param materialId Material ID
 * @returns Promise<boolean>
 */
export const deleteMaterial = async (materialId: number): Promise<boolean> => {
  const query = `
    DELETE FROM Material
    WHERE id = @materialId
  `;

  const result = await dbConnection.query(query, { materialId });
  return result.rowsAffected[0] > 0;
};

/**
 * Delete homework
 * @param homeworkId Homework ID
 * @returns Promise<boolean>
 */
export const deleteHomework = async (homeworkId: number): Promise<boolean> => {
  const query = `
    DELETE FROM Homework
    WHERE id = @homeworkId
  `;

  const result = await dbConnection.query(query, { homeworkId });
  return result.rowsAffected[0] > 0;
};
