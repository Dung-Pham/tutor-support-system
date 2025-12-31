/**
 * File: database/queries/lessonPlanQueries.ts
 * Purpose: Database queries for LessonPlan management
 */

import dbConnection from '../connection';

export interface LessonPlan {
  lesson_plan_id: string;
  class_id: string;
  lesson_number: number;
  session_date: Date;
  topic: string;
  description?: string;
  status: 'planned' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at?: Date;
}

export interface CreateLessonPlanDTO {
  class_id: string;
  lesson_number: number;
  session_date: Date | string;
  topic: string;
  description?: string;
  status?: string;
}

export interface UpdateLessonPlanDTO {
  lesson_number?: number;
  session_date?: Date | string;
  topic?: string;
  description?: string;
  status?: string;
}

/**
 * Create a new lesson plan
 */
export const createLessonPlan = async (data: CreateLessonPlanDTO): Promise<LessonPlan> => {
  const query = `
    INSERT INTO [LessonPlan] (
      class_id, lesson_number, session_date, topic, description, status, created_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @class_id, @lesson_number, @session_date, @topic, @description, @status, GETDATE()
    )
  `;

  const result = await dbConnection.query<LessonPlan>(query, {
    class_id: data.class_id,
    lesson_number: data.lesson_number,
    session_date: data.session_date,
    topic: data.topic,
    description: data.description || null,
    status: data.status || 'planned',
  });

  return result.recordset[0];
};

/**
 * Get lesson plans by class ID
 */
export const getLessonPlansByClass = async (classId: string): Promise<LessonPlan[]> => {
  const query = `
    SELECT *
    FROM [LessonPlan]
    WHERE class_id = @classId
    ORDER BY lesson_number ASC, session_date ASC
  `;

  const result = await dbConnection.query<LessonPlan>(query, { classId });
  return result.recordset;
};

/**
 * Get lesson plan by ID
 */
export const getLessonPlanById = async (lessonPlanId: string): Promise<LessonPlan | null> => {
  const query = `
    SELECT *
    FROM [LessonPlan]
    WHERE lesson_plan_id = @lessonPlanId
  `;

  const result = await dbConnection.query<LessonPlan>(query, { lessonPlanId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Update lesson plan
 */
export const updateLessonPlan = async (
  lessonPlanId: string,
  data: UpdateLessonPlanDTO
): Promise<LessonPlan> => {
  const updates: string[] = [];
  const params: Record<string, any> = { lessonPlanId };

  if (data.lesson_number !== undefined) {
    updates.push('lesson_number = @lesson_number');
    params.lesson_number = data.lesson_number;
  }
  if (data.session_date !== undefined) {
    updates.push('session_date = @session_date');
    params.session_date = data.session_date;
  }
  if (data.topic !== undefined) {
    updates.push('topic = @topic');
    params.topic = data.topic;
  }
  if (data.description !== undefined) {
    updates.push('description = @description');
    params.description = data.description;
  }
  if (data.status !== undefined) {
    updates.push('status = @status');
    params.status = data.status;
  }

  updates.push('updated_at = GETDATE()');

  const query = `
    UPDATE [LessonPlan]
    SET ${updates.join(', ')}
    OUTPUT INSERTED.*
    WHERE lesson_plan_id = @lessonPlanId
  `;

  const result = await dbConnection.query<LessonPlan>(query, params);
  return result.recordset[0];
};

/**
 * Delete lesson plan
 */
export const deleteLessonPlan = async (lessonPlanId: string): Promise<boolean> => {
  const query = `
    DELETE FROM [LessonPlan]
    WHERE lesson_plan_id = @lessonPlanId
  `;

  const result = await dbConnection.query(query, { lessonPlanId });
  return (result.rowsAffected?.[0] || 0) > 0;
};

/**
 * Bulk create lesson plans
 */
export const bulkCreateLessonPlans = async (
  classId: string,
  plans: Array<{
    lesson_number: number;
    session_date: Date | string;
    topic: string;
    description?: string;
  }>
): Promise<LessonPlan[]> => {
  const results: LessonPlan[] = [];
  
  for (const plan of plans) {
    const result = await createLessonPlan({
      class_id: classId,
      ...plan,
    });
    results.push(result);
  }
  
  return results;
};

/**
 * Get class statistics
 */
export const getClassStatistics = async (classId: string): Promise<{
  total_lessons: number;
  completed_lessons: number;
  planned_lessons: number;
  total_homework: number;
  completed_homework: number;
}> => {
  // Calculate total lessons from start_date, end_date, and sessions_per_week
  const classQuery = `
    SELECT 
      c.start_date,
      c.end_date,
      ISNULL(sch.sessions_per_week, 0) as sessions_per_week
    FROM [Class] c
    LEFT JOIN (
      SELECT class_id, MAX(CAST(day_of_week AS INT)) + 1 as sessions_per_week
      FROM [Schedule]
      WHERE class_id = @classId
      GROUP BY class_id
    ) sch ON c.class_id = sch.class_id
    WHERE c.class_id = @classId
  `;

  const classInfo = await dbConnection.query<any>(classQuery, { classId });

  // Get total lessons: count occurrences of each day_of_week between start_date and end_date
  const totalLessonsQuery = `
    SELECT 
      SUM(
        FLOOR(
          DATEDIFF(DAY,
            CASE 
              WHEN DATEPART(WEEKDAY, c.start_date) <= s.day_of_week
              THEN DATEADD(DAY, s.day_of_week - DATEPART(WEEKDAY, c.start_date), c.start_date)
              ELSE DATEADD(DAY, s.day_of_week - DATEPART(WEEKDAY, c.start_date) + 7, c.start_date)
            END,
            DATEADD(DAY, 1, c.end_date)
          ) / 7.0
        )
      ) as total_count
    FROM [Class] c
    CROSS JOIN (SELECT DISTINCT day_of_week FROM [Schedule] WHERE class_id = @classId) s
    WHERE c.class_id = @classId
  `;
  
  const totalResult = await dbConnection.query<{ total_count: number }>(totalLessonsQuery, { classId });
  const totalLessons = totalResult.recordset?.[0]?.total_count || 0;

  // Get actual attended lessons (both tutor and student confirmed)
  const query = `
    SELECT 
      COUNT(DISTINCT s.schedule_id) as completed_lessons
    FROM [Schedule] s
    INNER JOIN [AttendanceRecord] ar ON s.schedule_id = ar.schedule_id
    WHERE s.class_id = @classId
      AND ar.tutor_confirmed = 1
      AND ar.student_confirmed = 1
  `;

  const result = await dbConnection.query<{
    completed_lessons: number;
  }>(query, { classId });

  const completedLessons = result.recordset?.[0]?.completed_lessons || 0;
  const plannedLessons = Math.max(0, totalLessons - completedLessons);

  // Get homework statistics
  const homeworkQuery = `
    SELECT 
      COUNT(*) as total_homework,
      SUM(CASE WHEN status = 'completed' OR status = 'graded' THEN 1 ELSE 0 END) as completed_homework
    FROM [Homework]
    WHERE class_id = @classId
  `;

  let homeworkStats = { total_homework: 0, completed_homework: 0 };
  try {
    const homeworkResult = await dbConnection.query<{
      total_homework: number;
      completed_homework: number;
    }>(homeworkQuery, { classId });
    if (homeworkResult.recordset.length > 0) {
      homeworkStats = homeworkResult.recordset[0];
    }
  } catch (e) {
    // Homework table might not exist or have different schema
    console.log('Could not get homework stats:', e);
  }

  return {
    total_lessons: totalLessons,
    completed_lessons: completedLessons,
    planned_lessons: plannedLessons,
    total_homework: homeworkStats.total_homework || 0,
    completed_homework: homeworkStats.completed_homework || 0,
  };
};
