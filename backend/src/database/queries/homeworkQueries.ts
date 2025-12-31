/**
 * File: database/queries/homeworkQueries.ts
 * Purpose: Database queries for Materials and Homework management
 * Schema: Matches SQLTSSupportServer.sql
 */

import dbConnection from '../connection';

/**
 * Material interface matching actual SQL schema
 */
export interface Material {
  material_id: string; // UNIQUEIDENTIFIER
  class_id: string;
  schedule_id?: string;
  title: string;
  description?: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_by: string;
  created_at: Date;
  updated_at?: Date;
}

/**
 * Homework interface matching actual SQL schema
 */
export interface Homework {
  homework_id: string; // UNIQUEIDENTIFIER
  class_id?: string;
  schedule_id?: string;
  title: string;
  description?: string;
  due_date?: Date;
  assigned_by: string;
  tutor_id?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  max_score?: number;
  status?: string; // 'ACTIVE', 'CLOSED', 'CANCELLED'
  created_at?: Date;
  updated_at?: Date;
}

/**
 * HomeworkSubmission interface matching actual SQL schema
 */
export interface HomeworkSubmission {
  submission_id: string; // UNIQUEIDENTIFIER
  homework_id: string;
  submitted_by: string;
  assignment_id?: string;
  student_id?: string;
  content?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  submitted_at?: Date;
  score?: number;
  feedback?: string;
  graded_at?: Date;
  graded_by?: string;
  is_late?: boolean;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateMaterialDTO {
  class_id: string;
  schedule_id?: string;
  title: string;
  description?: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_by: string;
}

export interface CreateHomeworkDTO {
  class_id?: string;
  schedule_id?: string;
  title: string;
  description?: string;
  due_date?: Date | string;
  assigned_by: string;
  tutor_id?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  max_score?: number;
}

export interface UpdateHomeworkDTO {
  title?: string;
  description?: string;
  due_date?: Date | string;
  status?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  max_score?: number;
}

export interface SubmitHomeworkDTO {
  homework_id: string;
  assignment_id?: string;
  student_id: string; // will map to submitted_by
  content?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
}

export interface GradeHomeworkDTO {
  score: number;
  max_score?: number;
  feedback?: string;
  graded_by: string;
}

// ============================================================
// MATERIAL QUERIES
// ============================================================

/**
 * Upload/Create a material
 */
export const createMaterial = async (data: CreateMaterialDTO): Promise<Material> => {
  const query = `
    INSERT INTO [Material] (
      class_id, schedule_id, title, description,
      file_name, file_url, file_type, file_size,
      uploaded_by, created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @class_id, @schedule_id, @title, @description,
      @file_name, @file_url, @file_type, @file_size,
      @uploaded_by, GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<Material>(query, {
    class_id: data.class_id,
    schedule_id: data.schedule_id || null,
    title: data.title,
    description: data.description || null,
    file_name: data.file_name,
    file_url: data.file_url,
    file_type: data.file_type || null,
    file_size: data.file_size || null,
    uploaded_by: data.uploaded_by,
  });

  return result.recordset[0];
};

/**
 * Get materials by class or tutor
 */
export const getMaterials = async (filters: {
  class_id?: string;
  tutor_id?: string;
  schedule_id?: string;
  limit?: number;
  offset?: number;
}): Promise<{ materials: Material[]; total: number }> => {
  let whereConditions: string[] = ['1=1'];
  const params: Record<string, any> = {};

  if (filters.class_id) {
    whereConditions.push('m.class_id = @class_id');
    params.class_id = filters.class_id;
  }

  if (filters.tutor_id) {
    whereConditions.push('m.uploaded_by = @tutor_id');
    params.tutor_id = filters.tutor_id;
  }

  if (filters.schedule_id) {
    whereConditions.push('m.schedule_id = @schedule_id');
    params.schedule_id = filters.schedule_id;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM [Material] m
    WHERE ${whereClause}
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, params);
  const total = countResult.recordset[0].total;

  // Get materials
  const query = `
    SELECT m.*,
           c.description as class_name,
           u.name as uploader_name
    FROM [Material] m
    LEFT JOIN [Class] c ON m.class_id = c.class_id
    LEFT JOIN [UserAccount] u ON m.uploaded_by = u.user_id
    WHERE ${whereClause}
    ORDER BY m.created_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  params.limit = filters.limit || 20;
  params.offset = filters.offset || 0;

  const result = await dbConnection.query<Material>(query, params);

  return {
    materials: result.recordset,
    total,
  };
};

/**
 * Get material by ID
 */
export const getMaterialById = async (materialId: string): Promise<Material | null> => {
  const query = `
    SELECT m.*,
           c.description as class_name,
           u.name as uploader_name
    FROM [Material] m
    LEFT JOIN [Class] c ON m.class_id = c.class_id
    LEFT JOIN [UserAccount] u ON m.uploaded_by = u.user_id
    WHERE m.material_id = @materialId
  `;

  const result = await dbConnection.query<Material>(query, { materialId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Delete material
 */
export const deleteMaterial = async (materialId: string): Promise<boolean> => {
  const query = `
    DELETE FROM [Material]
    WHERE material_id = @materialId
  `;

  const result = await dbConnection.query(query, { materialId });
  return result.rowsAffected[0] > 0;
};

// ============================================================
// HOMEWORK QUERIES
// ============================================================

/**
 * Create homework
 */
export const createHomework = async (data: CreateHomeworkDTO): Promise<Homework> => {
  // Convert due_date string to proper Date object for SQL Server
  let dueDate: Date | null = null;
  if (data.due_date) {
    dueDate = new Date(data.due_date);
    // Ensure it's a valid date
    if (isNaN(dueDate.getTime())) {
      dueDate = null;
    }
  }

  const query = `
    INSERT INTO [Homework] (
      homework_id, class_id, schedule_id, title, description,
      due_date, [status], assigned_by, tutor_id,
      attachment_url, attachment_name, attachment_type, max_score,
      created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      NEWID(), @class_id, @schedule_id, @title, @description,
      @due_date, 'ACTIVE', @assigned_by, @tutor_id,
      @attachment_url, @attachment_name, @attachment_type, @max_score,
      GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<Homework>(query, {
    class_id: data.class_id || null,
    schedule_id: data.schedule_id || null,
    title: data.title,
    description: data.description || null,
    due_date: dueDate,
    assigned_by: data.assigned_by,
    tutor_id: data.tutor_id || data.assigned_by,
    attachment_url: data.attachment_url || null,
    attachment_name: data.attachment_name || null,
    attachment_type: data.attachment_type || null,
    max_score: data.max_score || 100,
  });

  return result.recordset[0];
};

/**
 * Get homework by ID
 */
export const getHomeworkById = async (homeworkId: string): Promise<Homework | null> => {
  const query = `
    SELECT h.*,
           c.description as class_name,
           u.name as assigned_by_name,
           (SELECT COUNT(*) FROM [HomeworkSubmission] WHERE homework_id = h.homework_id) as submission_count
    FROM [Homework] h
    LEFT JOIN [Class] c ON h.class_id = c.class_id
    LEFT JOIN [UserAccount] u ON h.assigned_by = u.user_id
    WHERE h.homework_id = @homeworkId
  `;

  const result = await dbConnection.query<Homework>(query, { homeworkId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get homework list with filters
 */
export const getHomework = async (filters: {
  class_id?: string;
  schedule_id?: string;
  student_id?: string;
  status?: string;
  assigned_by?: string;
  due_after?: Date | string;
  due_before?: Date | string;
  limit?: number;
  offset?: number;
}): Promise<{ homework: Homework[]; total: number }> => {
  let whereConditions: string[] = ['1=1'];
  const params: Record<string, any> = {};

  if (filters.class_id) {
    whereConditions.push('h.class_id = @class_id');
    params.class_id = filters.class_id;
  }

  if (filters.schedule_id) {
    whereConditions.push('h.schedule_id = @schedule_id');
    params.schedule_id = filters.schedule_id;
  }

  if (filters.status) {
    whereConditions.push('h.status = @status');
    params.status = filters.status;
  }

  if (filters.assigned_by) {
    whereConditions.push('h.assigned_by = @assigned_by');
    params.assigned_by = filters.assigned_by;
  }

  if (filters.due_after) {
    whereConditions.push('h.due_date >= @due_after');
    params.due_after = filters.due_after;
  }

  if (filters.due_before) {
    whereConditions.push('h.due_date <= @due_before');
    params.due_before = filters.due_before;
  }

  // If student_id is provided, filter by class membership
  if (filters.student_id) {
    whereConditions.push('c.student_id = @student_id');
    params.student_id = filters.student_id;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM [Homework] h
    LEFT JOIN [Class] c ON h.class_id = c.class_id
    WHERE ${whereClause}
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, params);
  const total = countResult.recordset[0].total;

  // Get homework
  const query = `
    SELECT h.*,
           c.description as class_name,
           u.name as assigned_by_name,
           (SELECT COUNT(*) FROM [HomeworkAssignment] WHERE homework_id = h.homework_id) as assigned_count,
           (SELECT COUNT(*) FROM [HomeworkSubmission] WHERE homework_id = h.homework_id) as submitted_count
    FROM [Homework] h
    LEFT JOIN [Class] c ON h.class_id = c.class_id
    LEFT JOIN [UserAccount] u ON h.assigned_by = u.user_id
    WHERE ${whereClause}
    ORDER BY h.created_at DESC
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
 */
export const updateHomework = async (
  homeworkId: string,
  data: UpdateHomeworkDTO
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

  if (data.attachment_url !== undefined) {
    updateFields.push('attachment_url = @attachment_url');
    params.attachment_url = data.attachment_url;
  }

  if (data.attachment_name !== undefined) {
    updateFields.push('attachment_name = @attachment_name');
    params.attachment_name = data.attachment_name;
  }

  if (data.max_score !== undefined) {
    updateFields.push('max_score = @max_score');
    params.max_score = data.max_score;
  }

  if (data.due_date !== undefined) {
    updateFields.push('due_date = @due_date');
    params.due_date = data.due_date;
  }

  if (data.status !== undefined) {
    updateFields.push('[status] = @status');
    params.status = data.status;
  }

  updateFields.push('updated_at = GETDATE()');

  const query = `
    UPDATE [Homework]
    SET ${updateFields.join(', ')}
    OUTPUT INSERTED.*
    WHERE homework_id = @homeworkId
  `;

  const result = await dbConnection.query<Homework>(query, params);
  return result.recordset[0];
};

/**
 * Delete homework
 */
export const deleteHomework = async (homeworkId: string): Promise<boolean> => {
  const query = `
    DELETE FROM [Homework]
    WHERE homework_id = @homeworkId
  `;

  const result = await dbConnection.query(query, { homeworkId });
  return result.rowsAffected[0] > 0;
};

// ============================================================
// HOMEWORK SUBMISSION QUERIES
// ============================================================

/**
 * Submit homework
 */
export const submitHomework = async (data: SubmitHomeworkDTO): Promise<HomeworkSubmission> => {
  // First, get assignment info to check due date and get homework_id
  let homeworkId = data.homework_id;
  let assignmentId = data.assignment_id;
  let isLate = false;

  if (data.assignment_id) {
    const assignmentQuery = `
      SELECT ha.assignment_id, ha.homework_id, ha.due_date
      FROM [HomeworkAssignment] ha
      WHERE ha.assignment_id = @assignment_id
    `;
    const assignmentResult = await dbConnection.query<{ assignment_id: string; homework_id: string; due_date: Date }>(
      assignmentQuery,
      { assignment_id: data.assignment_id }
    );
    if (assignmentResult.recordset.length > 0) {
      const assignment = assignmentResult.recordset[0];
      homeworkId = assignment.homework_id;
      assignmentId = assignment.assignment_id;
      isLate = assignment.due_date ? new Date() > new Date(assignment.due_date) : false;
    }
  }

  // Check if already submitted (by assignment_id or homework_id + student_id)
  // Try with assignment_id first, then fallback to homework_id + submitted_by
  let checkQuery = `
    SELECT submission_id
    FROM [HomeworkSubmission]
    WHERE homework_id = @homework_id AND submitted_by = @student_id
  `;
  
  // If we have assignment_id, also check by that
  if (assignmentId) {
    checkQuery = `
      SELECT submission_id
      FROM [HomeworkSubmission]
      WHERE assignment_id = @assignment_id 
         OR (homework_id = @homework_id AND submitted_by = @student_id)
    `;
  }

  const existing = await dbConnection.query<{ submission_id: string }>(checkQuery, {
    homework_id: homeworkId,
    student_id: data.student_id,
    assignment_id: assignmentId || null,
  });

  if (existing.recordset.length > 0) {
    // Update existing submission - use column names that exist in the schema
    // Try with new columns first, fallback to old column names
    const updateQuery = `
      UPDATE [HomeworkSubmission]
      SET content = COALESCE(@content, content),
          attachment_url = COALESCE(@attachment_url, attachment_url),
          attachment_name = COALESCE(@attachment_name, attachment_name),
          attachment_type = @attachment_type,
          submitted_at = GETDATE(),
          updated_at = GETDATE(),
          is_late = @is_late,
          status = 'SUBMITTED'
      OUTPUT INSERTED.*
      WHERE submission_id = @submission_id
    `;

    const result = await dbConnection.query<HomeworkSubmission>(updateQuery, {
      submission_id: existing.recordset[0].submission_id,
      content: data.content || null,
      attachment_url: data.attachment_url || null,
      attachment_name: data.attachment_name || null,
      attachment_type: data.attachment_type || null,
      is_late: isLate ? 1 : 0,
    });

    // Update assignment status
    if (assignmentId) {
      try {
        await dbConnection.query(`
          UPDATE [HomeworkAssignment]
          SET status = 'SUBMITTED', updated_at = GETDATE()
          WHERE assignment_id = @assignment_id
        `, { assignment_id: assignmentId });
      } catch (err) {
        console.warn('Could not update assignment status:', err);
      }
    }

    return result.recordset[0];
  }

  // Create new submission
  const insertQuery = `
    INSERT INTO [HomeworkSubmission] (
      submission_id, homework_id, submitted_by, assignment_id, student_id,
      content, attachment_url, attachment_name, attachment_type,
      submitted_at, is_late, status, created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      NEWID(), @homework_id, @student_id, @assignment_id, @student_id,
      @content, @attachment_url, @attachment_name, @attachment_type,
      GETDATE(), @is_late, 'SUBMITTED', GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<HomeworkSubmission>(insertQuery, {
    homework_id: homeworkId,
    student_id: data.student_id,
    assignment_id: assignmentId || null,
    content: data.content || null,
    attachment_url: data.attachment_url || null,
    attachment_name: data.attachment_name || null,
    attachment_type: data.attachment_type || null,
    is_late: isLate ? 1 : 0,
  });

  // Update assignment status
  if (assignmentId) {
    try {
      await dbConnection.query(`
        UPDATE [HomeworkAssignment]
        SET status = 'SUBMITTED', updated_at = GETDATE()
        WHERE assignment_id = @assignment_id
      `, { assignment_id: assignmentId });
    } catch (err) {
      console.warn('Could not update assignment status:', err);
    }
  }

  return result.recordset[0];
};

/**
 * Grade submission
 */
export const gradeSubmission = async (
  submissionId: string,
  grading: GradeHomeworkDTO
): Promise<HomeworkSubmission> => {
  const query = `
    UPDATE [HomeworkSubmission]
    SET score = @score,
        feedback = @feedback,
        graded_by = @graded_by,
        graded_at = GETDATE(),
        updated_at = GETDATE(),
        status = 'GRADED'
    OUTPUT INSERTED.*
    WHERE submission_id = @submissionId
  `;

  const result = await dbConnection.query<HomeworkSubmission>(query, {
    submissionId,
    score: grading.score,
    feedback: grading.feedback || null,
    graded_by: grading.graded_by,
  });

  // Update assignment status to GRADED
  if (result.recordset.length > 0 && result.recordset[0].assignment_id) {
    try {
      await dbConnection.query(`
        UPDATE [HomeworkAssignment]
        SET status = 'GRADED', updated_at = GETDATE()
        WHERE assignment_id = @assignment_id
      `, { assignment_id: result.recordset[0].assignment_id });
    } catch (err) {
      console.warn('Could not update assignment status:', err);
    }
  }

  return result.recordset[0];
};

/**
 * Get submissions by homework
 */
export const getSubmissionsByHomework = async (
  homeworkId: string
): Promise<HomeworkSubmission[]> => {
  const query = `
    SELECT hs.*,
           u.name as student_name,
           u.email as student_email,
           g.name as grader_name
    FROM [HomeworkSubmission] hs
    LEFT JOIN [UserAccount] u ON hs.submitted_by = u.user_id
    LEFT JOIN [UserAccount] g ON hs.graded_by = g.user_id
    WHERE hs.homework_id = @homeworkId
    ORDER BY hs.submitted_at DESC
  `;

  const result = await dbConnection.query<HomeworkSubmission>(query, { homeworkId });
  return result.recordset;
};

/**
 * Get submission by ID
 */
export const getSubmissionById = async (
  submissionId: string
): Promise<HomeworkSubmission | null> => {
  const query = `
    SELECT hs.*,
           h.title as homework_title,
           h.due_date,
           u.name as student_name,
           u.email as student_email,
           g.name as grader_name
    FROM [HomeworkSubmission] hs
    LEFT JOIN [Homework] h ON hs.homework_id = h.homework_id
    LEFT JOIN [UserAccount] u ON hs.submitted_by = u.user_id
    LEFT JOIN [UserAccount] g ON hs.graded_by = g.user_id
    WHERE hs.submission_id = @submissionId
  `;

  const result = await dbConnection.query<HomeworkSubmission>(query, { submissionId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get student's submission for specific homework
 */
export const getStudentSubmission = async (
  homeworkId: string,
  studentId: string
): Promise<HomeworkSubmission | null> => {
  const query = `
    SELECT hs.*,
           h.title as homework_title,
           h.due_date,
           g.name as grader_name
    FROM [HomeworkSubmission] hs
    LEFT JOIN [Homework] h ON hs.homework_id = h.homework_id
    LEFT JOIN [UserAccount] g ON hs.graded_by = g.user_id
    WHERE hs.homework_id = @homeworkId AND hs.submitted_by = @studentId
  `;

  const result = await dbConnection.query<HomeworkSubmission>(query, {
    homeworkId,
    studentId,
  });

  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Delete submission
 */
export const deleteSubmission = async (submissionId: string): Promise<boolean> => {
  const query = `
    DELETE FROM [HomeworkSubmission]
    WHERE submission_id = @submissionId
  `;

  const result = await dbConnection.query(query, { submissionId });
  return result.rowsAffected[0] > 0;
};

/**
 * Get homework statistics for a class
 */
export const getHomeworkStatistics = async (classId: string): Promise<{
  total_homework: number;
  active_homework: number;
  total_submissions: number;
  avg_score: number;
  completion_rate: number;
}> => {
  const query = `
    SELECT 
      COUNT(DISTINCT h.homework_id) as total_homework,
      SUM(CASE WHEN h.status = 'ACTIVE' THEN 1 ELSE 0 END) as active_homework,
      COUNT(hs.submission_id) as total_submissions,
      AVG(CAST(hs.score AS FLOAT) / NULLIF(hs.max_score, 0) * 100) as avg_score,
      CASE 
        WHEN COUNT(DISTINCT h.homework_id) > 0
        THEN CAST(COUNT(DISTINCT hs.homework_id) AS FLOAT) / COUNT(DISTINCT h.homework_id) * 100
        ELSE 0
      END as completion_rate
    FROM [Homework] h
    LEFT JOIN [HomeworkSubmission] hs ON h.homework_id = hs.homework_id
    WHERE h.class_id = @classId
  `;

  const result = await dbConnection.query<{
    total_homework: number;
    active_homework: number;
    total_submissions: number;
    avg_score: number;
    completion_rate: number;
  }>(query, { classId });

  return result.recordset[0];
};

/**
 * Assign homework to student
 */
export const assignHomeworkToStudent = async (data: {
  homework_id: string;
  student_id: string;
  assigned_by: string;
  due_date?: string;
  note?: string;
}): Promise<any> => {
  // Check if already assigned
  const checkQuery = `
    SELECT assignment_id FROM [HomeworkAssignment]
    WHERE homework_id = @homework_id AND student_id = @student_id
  `;
  const existing = await dbConnection.query(checkQuery, { 
    homework_id: data.homework_id, 
    student_id: data.student_id 
  });
  
  if (existing.recordset.length > 0) {
    throw new Error('Học viên này đã được giao bài tập này rồi');
  }

  // Convert due_date string to Date object for SQL Server
  let dueDate: Date | null = null;
  if (data.due_date) {
    dueDate = new Date(data.due_date);
    if (isNaN(dueDate.getTime())) {
      dueDate = null;
    }
  }

  // Insert assignment and get the ID
  const insertQuery = `
    DECLARE @newId UNIQUEIDENTIFIER = NEWID();
    
    INSERT INTO [HomeworkAssignment] (
      assignment_id, homework_id, student_id, assigned_by, due_date, note, status, assigned_at, updated_at
    )
    VALUES (
      @newId, @homework_id, @student_id, @assigned_by, @due_date, @note, 'ASSIGNED', GETDATE(), GETDATE()
    );
    
    SELECT 
      ha.*,
      u.name as student_name,
      u.email as student_email
    FROM [HomeworkAssignment] ha
    LEFT JOIN [UserAccount] u ON ha.student_id = u.user_id
    WHERE ha.assignment_id = @newId;
  `;

  const result = await dbConnection.query(insertQuery, {
    homework_id: data.homework_id,
    student_id: data.student_id,
    assigned_by: data.assigned_by,
    due_date: dueDate,
    note: data.note || null,
  });
  return result.recordset[0];
};

/**
 * Get student assignments with homework details
 */
export const getStudentAssignments = async (studentId: string): Promise<any[]> => {
  const query = `
    SELECT
      ha.assignment_id,
      ha.homework_id,
      ha.student_id,
      ha.assigned_by,
      ha.due_date,
      ha.note,
      ha.status as assignment_status,
      ha.assigned_at,
      h.title,
      h.description,
      h.class_id,
      h.attachment_url,
      h.attachment_name,
      h.attachment_type,
      h.max_score,
      u.name as tutor_name,
      u.email as tutor_email,
      hs.submission_id,
      hs.submitted_at,
      hs.is_late,
      hs.attachment_url as submission_attachment_url,
      hs.attachment_name as submission_attachment_name,
      hs.score,
      hs.feedback,
      hs.graded_at,
      hs.status as submission_status,
      CASE 
        WHEN hs.score IS NOT NULL THEN 'GRADED'
        WHEN hs.submitted_at IS NOT NULL THEN 'SUBMITTED'
        WHEN ha.due_date < GETDATE() THEN 'OVERDUE'
        ELSE 'PENDING'
      END as overall_status
    FROM [HomeworkAssignment] ha
    INNER JOIN [Homework] h ON ha.homework_id = h.homework_id
    INNER JOIN [UserAccount] u ON ha.assigned_by = u.user_id
    LEFT JOIN [HomeworkSubmission] hs ON ha.assignment_id = hs.assignment_id
    WHERE ha.student_id = @studentId
    ORDER BY ha.due_date DESC
  `;

  const result = await dbConnection.query(query, { studentId });
  return result.recordset;
};

/**
 * Get assignment by ID
 */
export const getAssignmentById = async (assignmentId: string): Promise<any | null> => {
  const query = `
    SELECT 
      ha.assignment_id,
      ha.homework_id,
      ha.student_id,
      ha.due_date,
      ha.note,
      ha.status as assignment_status,
      ha.assigned_at,
      h.title,
      h.description,
      h.attachment_url,
      h.attachment_name,
      h.attachment_type,
      h.max_score,
      h.status as homework_status,
      u.name as tutor_name,
      u.email as tutor_email,
      hs.submission_id,
      hs.content as submission_content,
      hs.submitted_at,
      hs.is_late,
      hs.score,
      hs.feedback,
      hs.graded_at,
      hs.status as submission_status,
      hs.attachment_url as submission_attachment_url,
      hs.attachment_name as submission_attachment_name,
      hs.attachment_type as submission_attachment_type,
      CASE 
        WHEN hs.score IS NOT NULL THEN 'GRADED'
        WHEN hs.submitted_at IS NOT NULL THEN 'SUBMITTED'
        WHEN ha.due_date < GETDATE() THEN 'OVERDUE'
        ELSE 'PENDING'
      END as overall_status
    FROM [HomeworkAssignment] ha
    INNER JOIN [Homework] h ON ha.homework_id = h.homework_id
    INNER JOIN [UserAccount] u ON h.assigned_by = u.user_id
    LEFT JOIN [HomeworkSubmission] hs ON ha.assignment_id = hs.assignment_id
    WHERE ha.assignment_id = @assignmentId
  `;

  const result = await dbConnection.query(query, { assignmentId });
  return result.recordset[0] || null;
};

/**
 * Delete assignment
 */
export const deleteAssignment = async (homeworkId: string, studentId: string): Promise<boolean> => {
  const query = `
    DELETE FROM [HomeworkAssignment]
    WHERE homework_id = @homeworkId AND student_id = @studentId
  `;

  const result = await dbConnection.query(query, { homeworkId, studentId });
  return result.rowsAffected[0] > 0;
};

/**
 * Get tutor's students from classes
 */
export const getTutorStudents = async (tutorId: string): Promise<any[]> => {
  const query = `
    SELECT DISTINCT
      u.user_id,
      u.name,
      u.email,
      c.class_id,
      c.description as class_name
    FROM [UserAccount] u
    INNER JOIN [Class] c ON u.user_id = c.student_id
    WHERE c.tutor_id = @tutorId AND UPPER(u.role) = 'STUDENT'
    ORDER BY c.description, u.name
  `;

  const result = await dbConnection.query(query, { tutorId });
  return result.recordset;
};
/**
 * Get homework detail with assignments (for tutor detail page)
 */
export const getHomeworkDetailWithAssignments = async (homeworkId: string): Promise<any | null> => {
  // Get homework details
  const homeworkQuery = `
    SELECT h.*,
           c.description as class_name,
           u.name as assigned_by_name,
           (SELECT COUNT(*) FROM [HomeworkAssignment] WHERE homework_id = h.homework_id) as assigned_count,
           (SELECT COUNT(*) FROM [HomeworkSubmission] WHERE homework_id = h.homework_id) as submitted_count
    FROM [Homework] h
    LEFT JOIN [Class] c ON h.class_id = c.class_id
    LEFT JOIN [UserAccount] u ON h.assigned_by = u.user_id
    WHERE h.homework_id = @homeworkId
  `;

  const homeworkResult = await dbConnection.query(homeworkQuery, { homeworkId });
  if (homeworkResult.recordset.length === 0) {
    return null;
  }

  const homework = homeworkResult.recordset[0];

  // Get assignments with submission details
  const assignmentsQuery = `
    SELECT 
      ha.assignment_id,
      ha.homework_id,
      ha.student_id,
      ha.due_date,
      ha.note,
      ha.status as assignment_status,
      ha.assigned_at,
      u.name as student_name,
      u.email as student_email,
      hs.submission_id,
      hs.content as submission_content,
      hs.attachment_url as submission_attachment_url,
      hs.attachment_name as submission_attachment_name,
      hs.attachment_type as submission_attachment_type,
      hs.submitted_at,
      hs.is_late,
      hs.score,
      hs.feedback,
      hs.graded_at,
      hs.status as submission_status,
      CASE 
        WHEN hs.score IS NOT NULL THEN 'GRADED'
        WHEN hs.submitted_at IS NOT NULL THEN 'SUBMITTED'
        WHEN ha.due_date < GETDATE() THEN 'OVERDUE'
        ELSE 'PENDING'
      END as overall_status
    FROM [HomeworkAssignment] ha
    INNER JOIN [UserAccount] u ON ha.student_id = u.user_id
    LEFT JOIN [HomeworkSubmission] hs ON ha.assignment_id = hs.assignment_id
    WHERE ha.homework_id = @homeworkId
    ORDER BY ha.assigned_at DESC
  `;

  const assignmentsResult = await dbConnection.query(assignmentsQuery, { homeworkId });

  return {
    ...homework,
    assignments: assignmentsResult.recordset || [],
  };
};