const sql = require('mssql');

async function testQuery() {
  try {
    await sql.connect({
      user: process.env.MSSQL_USER || 'sa',
      password: process.env.MSSQL_PASSWORD || '123456',
      server: process.env.MSSQL_HOST || 'localhost',
      database: process.env.MSSQL_DATABASE || 'tutorsupportdb0_2',
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    });

    const userId = 'AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA';
    const userRole = 'TUTOR';

    console.log('Testing query for user:', userId, 'role:', userRole);

    const query = `SELECT
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
    ORDER BY c.start_date DESC`;

    const request = new sql.Request();
    request.input('userId', sql.VarChar, userId);

    const result = await request.query(query);

    console.log('Query successful!');
    console.log('Results found:', result.recordset.length);
    result.recordset.forEach((c, i) => {
      console.log('Class ' + (i+1) + ':', {
        name: c.name,
        client_name: c.client_name,
        session_count: c.session_count
      });
    });

  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}

testQuery();