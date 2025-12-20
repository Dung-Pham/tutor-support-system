const sql = require('mssql');

async function testQuery() {
  const config = {
    server: 'localhost',
    database: 'tutorsupportdb1',
    user: 'sa',
    password: '123456',
    options: {
      encrypt: true,
      trustServerCertificate: true,
      instanceName: 'TSSERVER'
    }
  };

  try {
    const pool = await sql.connect(config);
    
    const userId = '89665505-B258-4EFC-A898-037A9C6D62A4';
    const weekStartDate = new Date('2025-11-24');
    const weekEndDate = new Date('2025-11-30');
    
    console.log('Testing query with:', { userId, weekStartDate, weekEndDate });
    
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('weekStartDate', sql.Date, weekStartDate)
      .input('weekEndDate', sql.Date, weekEndDate)
      .query(`
        SELECT 
          s.*,
          c.status as class_status,
          c.start_date as class_start_date,
          c.end_date as class_end_date,
          sub.name as subject_name
        FROM [Schedule] s
        INNER JOIN [Class] c ON s.class_id = c.class_id
        LEFT JOIN [Subjects] sub ON c.subject_id = sub.subject_id
        WHERE c.student_id = @userId
          AND s.is_active = 1
          AND c.status IN ('active', 'in_progress', 'completed')
          AND c.start_date <= @weekEndDate
          AND c.end_date >= @weekStartDate
        ORDER BY s.day_of_week
      `);
    
    console.log('Query result:');
    console.table(result.recordset);
    
    await sql.close();
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  }
}

testQuery();
