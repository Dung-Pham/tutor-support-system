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

async function checkUser() {
  try {
    await sql.connect(config);
    const result = await sql.query("SELECT user_id, name, email, role FROM UserAccount WHERE name LIKE N'%Trần H%'");
    console.log('User Trần H:', result.recordset);

    // Also check all students
    const allStudents = await sql.query("SELECT user_id, name, email, role FROM UserAccount WHERE role = 'student'");
    console.log('All students:', allStudents.recordset);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    sql.close();
  }
}

checkUser();