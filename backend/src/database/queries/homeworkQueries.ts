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
  class_id: string;
  schedule_id?: string;
  title: string;
  description?: string;
  instructions?: string;
  due_date: Date;
  status: string; // 'ACTIVE', 'CLOSED', 'CANCELLED'
  assigned_by: string;
  created_at: Date;
  updated_at?: Date;
}

/**
 * HomeworkSubmission interface matching actual SQL schema
 */
export interface HomeworkSubmission {
  submission_id: string; // UNIQUEIDENTIFIER
  homework_id: string;
  student_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  submitted_at: Date;
  score?: number;
  max_score: number; // DEFAULT 100
  feedback?: string;
  graded_at?: Date;
  graded_by?: string;
  created_at: Date;
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
  class_id: string;
  schedule_id?: string;
  title: string;
  description?: string;
  instructions?: string;
  due_date: Date | string;
  assigned_by: string;
}

export interface UpdateHomeworkDTO {
  title?: string;
  description?: string;
  instructions?: string;
  due_date?: Date | string;
  status?: string;
}

export interface SubmitHomeworkDTO {
  homework_id: string;
  student_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
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
           c.[name] as class_name,
           u.[name] as uploader_name
    FROM [Material] m
    LEFT JOIN [Class] c ON m.class_id = c.class_id
    LEFT JOIN [User] u ON m.uploaded_by = u.user_id
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
           c.[name] as class_name,
           u.[name] as uploader_name
    FROM [Material] m
    LEFT JOIN [Class] c ON m.class_id = c.class_id
    LEFT JOIN [User] u ON m.uploaded_by = u.user_id
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
  const query = `
    INSERT INTO [Homework] (
      class_id, schedule_id, title, description,
      instructions, due_date, [status], assigned_by,
      created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @class_id, @schedule_id, @title, @description,
      @instructions, @due_date, 'ACTIVE', @assigned_by,
      GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<Homework>(query, {
    class_id: data.class_id,
    schedule_id: data.schedule_id || null,
    title: data.title,
    description: data.description || null,
    instructions: data.instructions || null,
    due_date: data.due_date,
    assigned_by: data.assigned_by,
  });

  return result.recordset[0];
};

/**
 * Get homework by ID
 */
export const getHomeworkById = async (homeworkId: string): Promise<Homework | null> => {
  const query = `
    SELECT h.*,
           c.[name] as class_name,
           u.[name] as assigned_by_name,
           (SELECT COUNT(*) FROM [HomeworkSubmission] WHERE homework_id = h.homework_id) as submission_count
    FROM [Homework] h
    LEFT JOIN [Class] c ON h.class_id = c.class_id
    LEFT JOIN [User] u ON h.assigned_by = u.user_id
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
           c.[name] as class_name,
           u.[name] as assigned_by_name,
           (SELECT COUNT(*) FROM [HomeworkSubmission] WHERE homework_id = h.homework_id) as submission_count
    FROM [Homework] h
    LEFT JOIN [Class] c ON h.class_id = c.class_id
    LEFT JOIN [User] u ON h.assigned_by = u.user_id
    WHERE ${whereClause}
    ORDER BY h.due_date DESC
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

  if (data.instructions !== undefined) {
    updateFields.push('instructions = @instructions');
    params.instructions = data.instructions;
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
  // Check if already submitted
  const checkQuery = `
    SELECT submission_id
    FROM [HomeworkSubmission]
    WHERE homework_id = @homework_id AND student_id = @student_id
  `;

  const existing = await dbConnection.query<{ submission_id: string }>(checkQuery, {
    homework_id: data.homework_id,
    student_id: data.student_id,
  });

  if (existing.recordset.length > 0) {
    // Update existing submission
    const updateQuery = `
      UPDATE [HomeworkSubmission]
      SET file_name = @file_name,
          file_url = @file_url,
          file_size = @file_size,
          submitted_at = GETDATE(),
          updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE homework_id = @homework_id AND student_id = @student_id
    `;

    const result = await dbConnection.query<HomeworkSubmission>(updateQuery, {
      homework_id: data.homework_id,
      student_id: data.student_id,
      file_name: data.file_name,
      file_url: data.file_url,
      file_size: data.file_size || null,
    });

    return result.recordset[0];
  }

  // Create new submission
  const insertQuery = `
    INSERT INTO [HomeworkSubmission] (
      homework_id, student_id, file_name, file_url, file_size,
      submitted_at, max_score, created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @homework_id, @student_id, @file_name, @file_url, @file_size,
      GETDATE(), 100, GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<HomeworkSubmission>(insertQuery, {
    homework_id: data.homework_id,
    student_id: data.student_id,
    file_name: data.file_name,
    file_url: data.file_url,
    file_size: data.file_size || null,
  });

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
        max_score = @max_score,
        feedback = @feedback,
        graded_by = @graded_by,
        graded_at = GETDATE(),
        updated_at = GETDATE()
    OUTPUT INSERTED.*
    WHERE submission_id = @submissionId
  `;

  const result = await dbConnection.query<HomeworkSubmission>(query, {
    submissionId,
    score: grading.score,
    max_score: grading.max_score || 100,
    feedback: grading.feedback || null,
    graded_by: grading.graded_by,
  });

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
           u.[name] as student_name,
           u.email as student_email,
           g.[name] as grader_name
    FROM [HomeworkSubmission] hs
    LEFT JOIN [User] u ON hs.student_id = u.user_id
    LEFT JOIN [User] g ON hs.graded_by = g.user_id
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
           u.[name] as student_name,
           u.email as student_email,
           g.[name] as grader_name
    FROM [HomeworkSubmission] hs
    LEFT JOIN [Homework] h ON hs.homework_id = h.homework_id
    LEFT JOIN [User] u ON hs.student_id = u.user_id
    LEFT JOIN [User] g ON hs.graded_by = g.user_id
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
           g.[name] as grader_name
    FROM [HomeworkSubmission] hs
    LEFT JOIN [Homework] h ON hs.homework_id = h.homework_id
    LEFT JOIN [User] g ON hs.graded_by = g.user_id
    WHERE hs.homework_id = @homeworkId AND hs.student_id = @studentId
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
