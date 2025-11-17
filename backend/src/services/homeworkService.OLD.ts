/**
 * File: services/homeworkService.ts
 * Mục đích: Business logic cho materials & homework
 * Vai trò: Handle material uploads, homework CRUD, submissions, grading
 */

import {
  Material,
  UploadMaterialDTO,
  Homework,
  CreateHomeworkDTO,
  HomeworkSubmission,
  SubmitHomeworkDTO,
  GradeHomeworkDTO,
  HomeworkStatus
} from '../types';
import { executeQuery } from '../utils/database';
import { QueryTypes } from 'sequelize';

// ============ Material Management ============

/**
 * Upload material
 */
export const uploadMaterial = async (data: UploadMaterialDTO, uploadedBy: number): Promise<Material> => {
  const insertQuery = `
    INSERT INTO Material (scheduleId, subjectId, uploadedBy, title, description, type, fileUrl, fileSize, createdAt)
    OUTPUT INSERTED.*
    VALUES (:scheduleId, :subjectId, :uploadedBy, :title, :description, :type, :fileUrl, :fileSize, GETDATE())
  `;
  
  const result = await executeQuery<Material[]>(insertQuery, {
    scheduleId: data.scheduleId || null,
    subjectId: data.subjectId,
    uploadedBy,
    title: data.title,
    description: data.description || null,
    type: data.type,
    fileUrl: data.fileUrl,
    fileSize: data.fileSize || null
  }, QueryTypes.INSERT);
  
  return result[0];
};

/**
 * Get material by ID
 */
export const getMaterialById = async (materialId: number): Promise<Material | null> => {
  const query = `
    SELECT m.*,
           u.fullName as uploaderName,
           sub.subjectName
    FROM Material m
    JOIN [User] u ON m.uploadedBy = u.userId
    JOIN Subject sub ON m.subjectId = sub.subjectId
    WHERE m.materialId = :materialId
  `;
  
  const result = await executeQuery<any[]>(query, { materialId });
  return result.length > 0 ? result[0] : null;
};

/**
 * Get materials by subject
 */
export const getMaterialsBySubject = async (subjectId: number, page: number = 1, limit: number = 20): Promise<{ items: Material[]; totalItems: number }> => {
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT m.*,
           u.fullName as uploaderName
    FROM Material m
    JOIN [User] u ON m.uploadedBy = u.userId
    WHERE m.subjectId = :subjectId
    ORDER BY m.createdAt DESC
    OFFSET :offset ROWS
    FETCH NEXT :limit ROWS ONLY
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM Material
    WHERE subjectId = :subjectId
  `;
  
  const items = await executeQuery<Material[]>(query, { subjectId, offset, limit });
  const countResult = await executeQuery<[{ total: number }]>(countQuery, { subjectId });
  
  return {
    items,
    totalItems: countResult[0]?.total || 0
  };
};

/**
 * Get materials by schedule
 */
export const getMaterialsBySchedule = async (scheduleId: number): Promise<Material[]> => {
  const query = `
    SELECT m.*,
           u.fullName as uploaderName
    FROM Material m
    JOIN [User] u ON m.uploadedBy = u.userId
    WHERE m.scheduleId = :scheduleId
    ORDER BY m.createdAt DESC
  `;
  
  return await executeQuery<Material[]>(query, { scheduleId });
};

/**
 * Delete material
 */
export const deleteMaterial = async (materialId: number): Promise<void> => {
  const query = `
    DELETE FROM Material
    WHERE materialId = :materialId
  `;
  
  await executeQuery(query, { materialId }, QueryTypes.DELETE);
};

// ============ Homework Management ============

/**
 * Create homework
 */
export const createHomework = async (data: CreateHomeworkDTO, tutorId: number): Promise<Homework> => {
  const attachmentsJson = data.attachments ? JSON.stringify(data.attachments) : null;
  
  const insertQuery = `
    INSERT INTO Homework (scheduleId, tutorId, title, description, dueDate, maxScore, attachments, createdAt)
    OUTPUT INSERTED.*
    VALUES (:scheduleId, :tutorId, :title, :description, :dueDate, :maxScore, :attachments, GETDATE())
  `;
  
  const result = await executeQuery<Homework[]>(insertQuery, {
    scheduleId: data.scheduleId,
    tutorId,
    title: data.title,
    description: data.description,
    dueDate: data.dueDate,
    maxScore: data.maxScore,
    attachments: attachmentsJson
  }, QueryTypes.INSERT);
  
  return result[0];
};

/**
 * Get homework by ID
 */
export const getHomeworkById = async (homeworkId: number): Promise<Homework | null> => {
  const query = `
    SELECT h.*,
           s.startTime, s.endTime, s.studentId,
           t.fullName as tutorName,
           sub.subjectName
    FROM Homework h
    JOIN Schedule s ON h.scheduleId = s.scheduleId
    JOIN [User] t ON h.tutorId = t.userId
    JOIN Subject sub ON s.subjectId = sub.subjectId
    WHERE h.homeworkId = :homeworkId
  `;
  
  const result = await executeQuery<any[]>(query, { homeworkId });
  return result.length > 0 ? result[0] : null;
};

/**
 * Get homework by schedule
 */
export const getHomeworkBySchedule = async (scheduleId: number): Promise<Homework[]> => {
  const query = `
    SELECT h.*,
           t.fullName as tutorName
    FROM Homework h
    JOIN [User] t ON h.tutorId = t.userId
    WHERE h.scheduleId = :scheduleId
    ORDER BY h.createdAt DESC
  `;
  
  return await executeQuery<Homework[]>(query, { scheduleId });
};

/**
 * Get homework for a student
 */
export const getHomeworkForStudent = async (
  studentId: number,
  status?: HomeworkStatus,
  page: number = 1,
  limit: number = 10
): Promise<{ items: any[]; totalItems: number }> => {
  const offset = (page - 1) * limit;
  
  let whereClause = 'WHERE s.studentId = :studentId';
  const params: Record<string, any> = { studentId, offset, limit };
  
  if (status) {
    whereClause += ' AND COALESCE(hs.status, \'assigned\') = :status';
    params.status = status;
  }
  
  const query = `
    SELECT h.*,
           s.startTime, s.endTime,
           t.fullName as tutorName,
           sub.subjectName,
           hs.submissionId,
           hs.submittedAt,
           hs.score,
           hs.feedback,
           COALESCE(hs.status, 'assigned') as submissionStatus
    FROM Homework h
    JOIN Schedule s ON h.scheduleId = s.scheduleId
    JOIN [User] t ON h.tutorId = t.userId
    JOIN Subject sub ON s.subjectId = sub.subjectId
    LEFT JOIN HomeworkSubmission hs ON h.homeworkId = hs.homeworkId AND hs.studentId = :studentId
    ${whereClause}
    ORDER BY h.dueDate DESC
    OFFSET :offset ROWS
    FETCH NEXT :limit ROWS ONLY
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM Homework h
    JOIN Schedule s ON h.scheduleId = s.scheduleId
    LEFT JOIN HomeworkSubmission hs ON h.homeworkId = hs.homeworkId AND hs.studentId = :studentId
    ${whereClause}
  `;
  
  const items = await executeQuery<any[]>(query, params);
  const countResult = await executeQuery<[{ total: number }]>(countQuery, params);
  
  return {
    items,
    totalItems: countResult[0]?.total || 0
  };
};

/**
 * Update homework
 */
export const updateHomework = async (homeworkId: number, data: Partial<CreateHomeworkDTO>): Promise<Homework> => {
  const updates: string[] = [];
  const params: Record<string, any> = { homeworkId };
  
  if (data.title) {
    updates.push('title = :title');
    params.title = data.title;
  }
  
  if (data.description) {
    updates.push('description = :description');
    params.description = data.description;
  }
  
  if (data.dueDate) {
    updates.push('dueDate = :dueDate');
    params.dueDate = data.dueDate;
  }
  
  if (data.maxScore !== undefined) {
    updates.push('maxScore = :maxScore');
    params.maxScore = data.maxScore;
  }
  
  if (data.attachments !== undefined) {
    updates.push('attachments = :attachments');
    params.attachments = JSON.stringify(data.attachments);
  }
  
  if (updates.length === 0) {
    throw new Error('No fields to update');
  }
  
  const query = `
    UPDATE Homework
    SET ${updates.join(', ')}
    OUTPUT INSERTED.*
    WHERE homeworkId = :homeworkId
  `;
  
  const result = await executeQuery<Homework[]>(query, params, QueryTypes.UPDATE);
  
  if (result.length === 0) {
    throw new Error('Homework not found');
  }
  
  return result[0];
};

/**
 * Delete homework
 */
export const deleteHomework = async (homeworkId: number): Promise<void> => {
  const query = `
    DELETE FROM Homework
    WHERE homeworkId = :homeworkId
  `;
  
  await executeQuery(query, { homeworkId }, QueryTypes.DELETE);
};

// ============ Homework Submission Management ============

/**
 * Submit homework
 */
export const submitHomework = async (
  homeworkId: number,
  studentId: number,
  data: SubmitHomeworkDTO
): Promise<HomeworkSubmission> => {
  // Check if already submitted
  const existingQuery = `
    SELECT submissionId
    FROM HomeworkSubmission
    WHERE homeworkId = :homeworkId AND studentId = :studentId
  `;
  
  const existing = await executeQuery<any[]>(existingQuery, { homeworkId, studentId });
  
  if (existing.length > 0) {
    throw new Error('Homework already submitted. Use update submission instead.');
  }
  
  // Check if homework is overdue
  const homeworkQuery = `
    SELECT dueDate
    FROM Homework
    WHERE homeworkId = :homeworkId
  `;
  
  const homework = await executeQuery<any[]>(homeworkQuery, { homeworkId });
  
  if (homework.length === 0) {
    throw new Error('Homework not found');
  }
  
  const isLate = new Date() > new Date(homework[0].dueDate);
  const status = isLate ? 'late' : 'submitted';
  
  const attachmentsJson = data.attachments ? JSON.stringify(data.attachments) : null;
  
  const insertQuery = `
    INSERT INTO HomeworkSubmission (homeworkId, studentId, submittedAt, attachments, notes, status)
    OUTPUT INSERTED.*
    VALUES (:homeworkId, :studentId, GETDATE(), :attachments, :notes, :status)
  `;
  
  const result = await executeQuery<HomeworkSubmission[]>(insertQuery, {
    homeworkId,
    studentId,
    attachments: attachmentsJson,
    notes: data.notes || null,
    status
  }, QueryTypes.INSERT);
  
  return result[0];
};

/**
 * Get submission by ID
 */
export const getSubmissionById = async (submissionId: number): Promise<HomeworkSubmission | null> => {
  const query = `
    SELECT hs.*,
           h.title as homeworkTitle,
           h.maxScore,
           s.fullName as studentName
    FROM HomeworkSubmission hs
    JOIN Homework h ON hs.homeworkId = h.homeworkId
    JOIN [User] s ON hs.studentId = s.userId
    WHERE hs.submissionId = :submissionId
  `;
  
  const result = await executeQuery<any[]>(query, { submissionId });
  return result.length > 0 ? result[0] : null;
};

/**
 * Get submissions for homework
 */
export const getSubmissionsByHomework = async (homeworkId: number): Promise<HomeworkSubmission[]> => {
  const query = `
    SELECT hs.*,
           s.fullName as studentName
    FROM HomeworkSubmission hs
    JOIN [User] s ON hs.studentId = s.userId
    WHERE hs.homeworkId = :homeworkId
    ORDER BY hs.submittedAt DESC
  `;
  
  return await executeQuery<HomeworkSubmission[]>(query, { homeworkId });
};

/**
 * Grade homework submission
 */
export const gradeSubmission = async (
  submissionId: number,
  data: GradeHomeworkDTO
): Promise<HomeworkSubmission> => {
  const query = `
    UPDATE HomeworkSubmission
    SET score = :score,
        feedback = :feedback,
        gradedAt = GETDATE(),
        status = 'graded'
    OUTPUT INSERTED.*
    WHERE submissionId = :submissionId
  `;
  
  const result = await executeQuery<HomeworkSubmission[]>(query, {
    submissionId,
    score: data.score,
    feedback: data.feedback || null
  }, QueryTypes.UPDATE);
  
  if (result.length === 0) {
    throw new Error('Submission not found');
  }
  
  return result[0];
};

/**
 * Update submission
 */
export const updateSubmission = async (
  submissionId: number,
  data: SubmitHomeworkDTO
): Promise<HomeworkSubmission> => {
  const updates: string[] = [];
  const params: Record<string, any> = { submissionId };
  
  if (data.attachments !== undefined) {
    updates.push('attachments = :attachments');
    params.attachments = JSON.stringify(data.attachments);
  }
  
  if (data.notes !== undefined) {
    updates.push('notes = :notes');
    params.notes = data.notes;
  }
  
  updates.push('submittedAt = GETDATE()');
  
  if (updates.length === 0) {
    throw new Error('No fields to update');
  }
  
  const query = `
    UPDATE HomeworkSubmission
    SET ${updates.join(', ')}
    OUTPUT INSERTED.*
    WHERE submissionId = :submissionId
  `;
  
  const result = await executeQuery<HomeworkSubmission[]>(query, params, QueryTypes.UPDATE);
  
  if (result.length === 0) {
    throw new Error('Submission not found');
  }
  
  return result[0];
};
