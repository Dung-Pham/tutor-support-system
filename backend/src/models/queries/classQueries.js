/**
 * File: classQueries.js
 * Mục đích: Database queries cho Class operations
 * Vai trò:
 *   - Định nghĩa SQL queries cho class management
 *   - Handle database interactions
 * Lưu ý:
 *   - Sử dụng parameterized queries để tránh SQL injection
 *   - Return consistent data format
 *   - Handle database errors appropriately
 */

const sql = require('mssql');

// Try to use shared dbConnection if available, otherwise create local config
let dbConnection;
try {
  dbConnection = require('../database/connection');
} catch (e) {
  console.log('dbConnection not available, will create local connection');
  dbConnection = null;
}

/**
 * Get classes for a user based on their role
 * @param {string} userId - User ID
 * @param {string} userRole - User role (TUTOR or USER)
 * @returns {Promise<Array>} Array of class objects
 */
const getMyClassesQuery = async (userId, userRole) => {
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

    let query;
    let request = pool.request();

    if (userRole === 'TUTOR') {
      // Get classes where user is the tutor
      query = `
        SELECT
          c.class_id,
          c.tutor_id,
          c.user_id as client_id,
          c.name,
          c.subject,
          c.grade_level,
          c.description,
          c.status,
          c.start_date,
          c.end_date,
          ua_tutor.name as tutor_name,
          ua_client.name as client_name,
          COUNT(s.schedule_id) as session_count
        FROM [Class] c
        LEFT JOIN [UserAccount] ua_tutor ON c.tutor_id = ua_tutor.user_id
        LEFT JOIN [UserAccount] ua_client ON c.user_id = ua_client.user_id
        LEFT JOIN [Schedule] s ON c.class_id = s.class_id
        WHERE c.tutor_id = @userId
        GROUP BY c.class_id, c.tutor_id, c.user_id, c.name, c.subject, c.grade_level, 
                 c.description, c.status, c.start_date, c.end_date, ua_tutor.name, ua_client.name
        ORDER BY c.start_date DESC
      `;
    } else if (userRole === 'USER') {
      // Get classes where user is the client
      query = `
        SELECT
          c.class_id,
          c.tutor_id,
          c.user_id as client_id,
          c.name,
          c.subject,
          c.grade_level,
          c.description,
          c.status,
          c.start_date,
          c.end_date,
          ua_tutor.name as tutor_name,
          ua_client.name as client_name,
          COUNT(s.schedule_id) as session_count
        FROM [Class] c
        LEFT JOIN [UserAccount] ua_tutor ON c.tutor_id = ua_tutor.user_id
        LEFT JOIN [UserAccount] ua_client ON c.user_id = ua_client.user_id
        LEFT JOIN [Schedule] s ON c.class_id = s.class_id
        WHERE c.user_id = @userId
        GROUP BY c.class_id, c.tutor_id, c.user_id, c.name, c.subject, c.grade_level,
                 c.description, c.status, c.start_date, c.end_date, ua_tutor.name, ua_client.name
        ORDER BY c.start_date DESC
      `;
    } else {
      throw new Error('Invalid user role');
    }

    request.input('userId', sql.VarChar, userId);

    const result = await request.query(query);

    // Format the results
    const classes = result.recordset.map(row => ({
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

module.exports = {
  getMyClassesQuery,
};