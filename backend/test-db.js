const sql = require('mssql');

async function insertSampleData() {
  try {
    const config = {
      user: 'sa',
      password: '123456',
      server: 'localhost',
      database: 'tutorsupportdb0_2',
      options: { encrypt: false, trustServerCertificate: true }
    };
    const pool = await sql.connect(config);

    console.log('=== Checking existing data ===');

    // Check existing users
    const users = await pool.request().query('SELECT user_id, name, email, role FROM UserAccount');
    console.table(users.recordset);

    // Check existing classes
    const classes = await pool.request().query('SELECT * FROM Class');
    console.table(classes.recordset);

    // Insert sample class data if needed
    const tutorId = 'AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA'; // tutor1
    const studentResult = await pool.request().query(`
      SELECT user_id FROM UserAccount
      WHERE email = 'student1@example.com' AND role = 'USER'
    `);

    if (studentResult.recordset.length > 0) {
      const studentId = studentResult.recordset[0].user_id;

      // Check if class already exists
      const existingClass = await pool.request()
        .input('tutorId', sql.UniqueIdentifier, tutorId)
        .input('studentId', sql.UniqueIdentifier, studentId)
        .query('SELECT * FROM Class WHERE tutor_id = @tutorId AND user_id = @studentId');

      if (existingClass.recordset.length === 0) {
        console.log('Inserting sample class data...');

        await pool.request()
          .input('classId', sql.UniqueIdentifier, 'CCCC1111-CCCC-CCCC-CCCC-CCCCCCCCCCCC')
          .input('name', sql.NVarChar, 'Toán cao cấp')
          .input('tutorId', sql.UniqueIdentifier, tutorId)
          .input('userId', sql.UniqueIdentifier, studentId)
          .query(`
            INSERT INTO Class (class_id, name, tutor_id, user_id, status, created_at)
            VALUES (@classId, @name, @tutorId, @userId, 'active', GETDATE())
          `);

        console.log('Sample class data inserted successfully');
      } else {
        console.log('Class data already exists');
      }

      // Test the query
      console.log('\n=== Testing getTutorStudents query ===');
      const students = await pool.request()
        .input('tutorId', sql.UniqueIdentifier, tutorId)
        .query(`
          SELECT DISTINCT u.user_id, u.name, u.email, c.class_id, c.name as class_name
          FROM UserAccount u
          JOIN Class c ON c.user_id = u.user_id
          WHERE c.tutor_id = @tutorId AND u.role = 'USER' AND u.status = 'active'
          ORDER BY u.name
        `);
      console.table(students.recordset);

    } else {
      console.log('Student not found');
    }

    await pool.close();
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
}

insertSampleData();