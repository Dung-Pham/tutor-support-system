/**
 * File: classQueries.ts
 * Mục đích: Database queries cho Class operations
 * Vai trò:
 *   - Định nghĩa SQL queries cho class management
 *   - Handle database interactions
 * Lưu ý:
 *   - Sử dụng parameterized queries để tránh SQL injection
 *   - Return consistent data format
 *   - Handle database errors appropriately
 */

import sql from 'mssql';
import type { IRecordSet } from 'mssql';
const { ConnectionPool } = sql;

// Interface definitions
interface ClassRecord {
  class_id: string;
  tutor_id: string;
  client_id: string;
  name: string;
  description: string;
  subject: string;
  grade_level: string;
  status: string;
  start_date: Date | null;
  end_date: Date | null;
  tutor_name: string;
  client_name: string;
  session_count: number;
}

interface FormattedClass {
  class_id: string;
  tutor_id: string;
  client_id: string;
  name: string;
  description: string;
  subject: string;
  grade_level: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  tutor_name: string;
  client_name: string;
  session_count: number;
}

// Try to use shared dbConnection if available, otherwise create local config
let dbConnection: { getPool?: () => ConnectionPool } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  dbConnection = require('../../database/connection');
} catch {
  console.log('dbConnection not available, will create local connection');
  dbConnection = null;
}

/**
 * Get classes for a user based on their role
 * @param userId - User ID
 * @param userRole - User role (tutor or student)
 * @returns Promise<Array> Array of class objects
 */
const getMyClassesQuery = async (
  userId: string,
  userRole: string
): Promise<FormattedClass[]> => {
  let pool: ConnectionPool | null = null;
  try {
    // Use shared connection if available
    if (dbConnection && dbConnection.getPool) {
      pool = dbConnection.getPool();
    } else {
      // Fallback: create connection with hardcoded values for testing
      const config: sql.config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'tutorsupportdb1',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      pool = await sql.connect(config);
    }

    let query: string;
    const request = pool.request();

    if (userRole === 'tutor') {
      // Get classes where user is the tutor
      query = `
        SELECT
          c.class_id,
          c.tutor_id,
          c.student_id as client_id,
          c.description as name,
          c.description,
          s.name as subject,
          c.grade_level,
          c.status,
          c.start_date,
          c.end_date,
          ua_tutor.name as tutor_name,
          ua_client.name as client_name,
          COUNT(sc.schedule_id) as session_count
        FROM [Class] c
        LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
        LEFT JOIN [UserAccount] ua_tutor ON c.tutor_id = ua_tutor.user_id
        LEFT JOIN [UserAccount] ua_client ON c.student_id = ua_client.user_id
        LEFT JOIN [Schedule] sc ON c.class_id = sc.class_id
        WHERE c.tutor_id = @userId
        GROUP BY c.class_id, c.tutor_id, c.student_id, c.description, s.name, c.grade_level,
                 c.status, c.start_date, c.end_date, ua_tutor.name, ua_client.name
        ORDER BY c.start_date DESC
      `;
    } else if (userRole === 'student') {
      // Get classes where user is the student
      query = `
        SELECT
          c.class_id,
          c.tutor_id,
          c.student_id as client_id,
          c.description as name,
          c.description,
          s.name as subject,
          c.grade_level,
          c.status,
          c.start_date,
          c.end_date,
          ua_tutor.name as tutor_name,
          ua_client.name as client_name,
          COUNT(sc.schedule_id) as session_count
        FROM [Class] c
        LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
        LEFT JOIN [UserAccount] ua_tutor ON c.tutor_id = ua_tutor.user_id
        LEFT JOIN [UserAccount] ua_client ON c.student_id = ua_client.user_id
        LEFT JOIN [Schedule] sc ON c.class_id = sc.class_id
        WHERE c.student_id = @userId
        GROUP BY c.class_id, c.tutor_id, c.student_id, c.description, s.name, c.grade_level,
                 c.status, c.start_date, c.end_date, ua_tutor.name, ua_client.name
        ORDER BY c.start_date DESC
      `;
    } else {
      throw new Error('Invalid user role');
    }

    request.input('userId', sql.VarChar, userId);

    const result = await request.query(query);
    const recordset = result.recordset as IRecordSet<ClassRecord>;

    // Format the results
    const classes: FormattedClass[] = recordset.map((row: ClassRecord) => ({
      class_id: row.class_id,
      tutor_id: row.tutor_id,
      client_id: row.client_id,
      name: row.name,
      description: row.description,
      subject: row.subject,
      grade_level: row.grade_level,
      start_date: row.start_date ? row.start_date.toISOString().split('T')[0] : null,
      end_date: row.end_date ? row.end_date.toISOString().split('T')[0] : null,
      status: row.status,
      tutor_name: row.tutor_name,
      client_name: row.client_name,
      session_count: row.session_count || 0,
    }));

    // Close the connection pool
    await pool.close();

    return classes;
  } catch (error) {
    console.error('Error in getMyClassesQuery:', error);
    // Make sure to close the pool even on error
    try {
      if (pool) await pool.close();
    } catch (closeError) {
      console.error('Error closing pool:', closeError);
    }
    throw error;
  }
};

export { getMyClassesQuery };
