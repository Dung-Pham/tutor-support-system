/**
 * File: database/queries/evaluationQueries.ts
 * Purpose: Database queries for Progress Evaluation management
 * Schema: Matches new ProgressEvaluation table (attendance_id, class_id, evaluated_by)
 */

import dbConnection from '../connection';

/**
 * ProgressEvaluation interface matching new SQL schema
 */
export interface ProgressEvaluation {
  evaluation_id: string; // UNIQUEIDENTIFIER
  attendance_id: string;
  class_id: string;
  schedule_id: string;
  overall_rating: number; // 1-5
  competency_level?: string;
  comments?: string;
  understanding_score?: number;
  participation_score?: number;
  homework_completion?: number;
  behavior_score?: number;
  evaluated_by: string; // tutor_id (UserAccount.user_id)
  evaluated_at: Date;
  created_at: Date;
  updated_at?: Date;
  // Joined fields
  tutor_name?: string;
  user_name?: string;
  class_name?: string;
}

export interface CreateEvaluationDTO {
  attendance_id: string;
  class_id: string;
  schedule_id: string;
  overall_rating: number; // 1-5
  competency_level?: string;
  comments?: string;
  understanding_score?: number;
  participation_score?: number;
  homework_completion?: number;
  behavior_score?: number;
  evaluated_by: string; // tutor_id
}

/**
 * Create a progress evaluation
 */
export const createEvaluation = async (data: CreateEvaluationDTO): Promise<ProgressEvaluation> => {
  const query = `
    INSERT INTO ProgressEvaluation (
      attendance_id, class_id, schedule_id,
      overall_rating, competency_level, comments,
      understanding_score, participation_score, homework_completion, behavior_score,
      evaluated_by, evaluated_at, created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @attendance_id, @class_id, @schedule_id,
      @overall_rating, @competency_level, @comments,
      @understanding_score, @participation_score, @homework_completion, @behavior_score,
      @evaluated_by, GETDATE(), GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<ProgressEvaluation>(query, {
    attendance_id: data.attendance_id,
    class_id: data.class_id,
    schedule_id: data.schedule_id,
    overall_rating: data.overall_rating,
    competency_level: data.competency_level || null,
    comments: data.comments || null,
    understanding_score: data.understanding_score || null,
    participation_score: data.participation_score || null,
    homework_completion: data.homework_completion || null,
    behavior_score: data.behavior_score || null,
    evaluated_by: data.evaluated_by,
  });

  return result.recordset[0];
};

/**
 * Get evaluation by ID
 */
export const getEvaluationById = async (
  evaluationId: string
): Promise<ProgressEvaluation | null> => {
  const query = `
    SELECT pe.*,
           u1.[name] as tutor_name,
           u2.[name] as user_name,
           c.[name] as class_name
    FROM ProgressEvaluation pe
    LEFT JOIN [UserAccount] u1 ON pe.evaluated_by = u1.user_id
    LEFT JOIN [Schedule] s ON pe.schedule_id = s.schedule_id
    LEFT JOIN [UserAccount] u2 ON s.user_id = u2.user_id
    LEFT JOIN [Class] c ON pe.class_id = c.class_id
    WHERE pe.evaluation_id = @evaluationId
  `;

  const result = await dbConnection.query<ProgressEvaluation>(query, { evaluationId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Get evaluations by schedule
 */
export const getEvaluationsBySchedule = async (
  scheduleId: string
): Promise<ProgressEvaluation[]> => {
  const query = `
    SELECT pe.*,
           u1.[name] as tutor_name,
           u2.[name] as user_name
    FROM ProgressEvaluation pe
    LEFT JOIN [UserAccount] u1 ON pe.evaluated_by = u1.user_id
    LEFT JOIN [Schedule] s ON pe.schedule_id = s.schedule_id
    LEFT JOIN [UserAccount] u2 ON s.user_id = u2.user_id
    WHERE pe.schedule_id = @scheduleId
    ORDER BY pe.evaluated_at DESC
  `;

  const result = await dbConnection.query<ProgressEvaluation>(query, { scheduleId });
  return result.recordset;
};

/**
 * Get evaluations by class
 */
export const getEvaluationsByClass = async (
  classId: string,
  filters?: {
    month?: number;
    year?: number;
    limit?: number;
    offset?: number;
  }
): Promise<{ evaluations: ProgressEvaluation[]; total: number }> => {
  let whereConditions: string[] = ['pe.class_id = @classId'];
  const params: Record<string, any> = { classId };

  if (filters?.month && filters?.year) {
    whereConditions.push('MONTH(pe.evaluated_at) = @month');
    whereConditions.push('YEAR(pe.evaluated_at) = @year');
    params.month = filters.month;
    params.year = filters.year;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM ProgressEvaluation pe
    WHERE ${whereClause}
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, params);
  const total = countResult.recordset[0].total;

  // Get evaluations
  const query = `
    SELECT pe.*,
           u1.[name] as tutor_name,
           u2.[name] as user_name,
           c.[name] as class_name
    FROM ProgressEvaluation pe
    LEFT JOIN [UserAccount] u1 ON pe.evaluated_by = u1.user_id
    LEFT JOIN [Schedule] s ON pe.schedule_id = s.schedule_id
    LEFT JOIN [UserAccount] u2 ON s.user_id = u2.user_id
    LEFT JOIN [Class] c ON pe.class_id = c.class_id
    WHERE ${whereClause}
    ORDER BY pe.evaluated_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  params.limit = filters?.limit || 20;
  params.offset = filters?.offset || 0;

  const result = await dbConnection.query<ProgressEvaluation>(query, params);

  return {
    evaluations: result.recordset,
    total,
  };
};

/**
 * Get evaluation statistics for a class
 */
export const getEvaluationStatistics = async (
  classId: string,
  month?: number,
  year?: number
): Promise<{
  total_evaluations: number;
  average_overall_rating: number;
  average_understanding: number;
  average_participation: number;
  average_homework: number;
  average_behavior: number;
}> => {
  let whereConditions: string[] = ['class_id = @classId'];
  const params: Record<string, any> = { classId };

  if (month && year) {
    whereConditions.push('MONTH(evaluated_at) = @month');
    whereConditions.push('YEAR(evaluated_at) = @year');
    params.month = month;
    params.year = year;
  }

  const whereClause = whereConditions.join(' AND ');

  const query = `
    SELECT 
      COUNT(*) as total_evaluations,
      AVG(CAST(overall_rating as FLOAT)) as average_overall_rating,
      AVG(CAST(understanding_score as FLOAT)) as average_understanding,
      AVG(CAST(participation_score as FLOAT)) as average_participation,
      AVG(CAST(homework_completion as FLOAT)) as average_homework,
      AVG(CAST(behavior_score as FLOAT)) as average_behavior
    FROM ProgressEvaluation
    WHERE ${whereClause}
  `;

  const result = await dbConnection.query<{
    total_evaluations: number;
    average_overall_rating: number;
    average_understanding: number;
    average_participation: number;
    average_homework: number;
    average_behavior: number;
  }>(query, params);

  return result.recordset[0];
};

/**
 * Update evaluation
 */
export const updateEvaluation = async (
  evaluationId: string,
  data: Partial<CreateEvaluationDTO>
): Promise<ProgressEvaluation> => {
  const updateFields: string[] = [];
  const params: Record<string, any> = { evaluationId };

  if (data.overall_rating !== undefined) {
    updateFields.push('overall_rating = @overall_rating');
    params.overall_rating = data.overall_rating;
  }

  if (data.competency_level !== undefined) {
    updateFields.push('competency_level = @competency_level');
    params.competency_level = data.competency_level;
  }

  if (data.comments !== undefined) {
    updateFields.push('comments = @comments');
    params.comments = data.comments;
  }

  if (data.understanding_score !== undefined) {
    updateFields.push('understanding_score = @understanding_score');
    params.understanding_score = data.understanding_score;
  }

  if (data.participation_score !== undefined) {
    updateFields.push('participation_score = @participation_score');
    params.participation_score = data.participation_score;
  }

  if (data.homework_completion !== undefined) {
    updateFields.push('homework_completion = @homework_completion');
    params.homework_completion = data.homework_completion;
  }

  if (data.behavior_score !== undefined) {
    updateFields.push('behavior_score = @behavior_score');
    params.behavior_score = data.behavior_score;
  }

  updateFields.push('updated_at = GETDATE()');

  const query = `
    UPDATE ProgressEvaluation
    SET ${updateFields.join(', ')}
    OUTPUT INSERTED.*
    WHERE evaluation_id = @evaluationId
  `;

  const result = await dbConnection.query<ProgressEvaluation>(query, params);
  return result.recordset[0];
};

/**
 * Delete evaluation
 */
export const deleteEvaluation = async (evaluationId: string): Promise<boolean> => {
  const query = `
    DELETE FROM ProgressEvaluation
    WHERE evaluation_id = @evaluationId
  `;

  const result = await dbConnection.query(query, { evaluationId });
  return result.rowsAffected[0] > 0;
};
