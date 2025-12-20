const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'tutorsupportdb1',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function checkClasses() {
  try {
    await sql.connect(config);
    const result = await sql.query(`
      SELECT c.class_id, c.description as name, s.name as subject, c.grade_level, c.status, c.start_date, c.end_date,
             ua_tutor.name as tutor_name, ua_student.name as student_name
      FROM [Class] c
      LEFT JOIN [Subjects] s ON c.subject_id = s.subject_id
      LEFT JOIN [UserAccount] ua_tutor ON c.tutor_id = ua_tutor.user_id
      LEFT JOIN [UserAccount] ua_student ON c.student_id = ua_student.user_id
      WHERE c.student_id = '89665505-B258-4EFC-A898-037A9C6D62A4'
    `);
    console.log('Classes for Trần H:', result.recordset);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    sql.close();
  }
}

checkClasses();