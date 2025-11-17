const jwt = require('jsonwebtoken');
const sql = require('mssql');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function debugAuth() {
  console.log('JWT_SECRET being used:', JWT_SECRET);

  // Test token
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJBQUFBMTExMS1BQUFBLUFBQUEtQUFBQS1BQUFBQUFBQUFBQUEiLCJlbWFpbCI6InR1dG9yMUBleGFtcGxlLmNvbSIsInJvbGUiOiJUVVRPUiIsImlhdCI6MTc2MzM0NzAyOSwiZXhwIjoxNzYzMzUwNjI5fQ.XjEekFW3qD12on_92lZQMRsTgzjUr0_ZyyQxwT9GZ40';

  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully:', decoded);

    // Test database connection and query
    console.log('Connecting to database...');
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

    console.log('Querying user...');
    const query = 'SELECT user_id, email, name, phone, role, status FROM [UserAccount] WHERE user_id = @userId';
    const request = new sql.Request();
    request.input('userId', sql.VarChar, decoded.userId);

    const result = await request.query(query);
    console.log('User query result:', result.recordset[0] || 'User not found');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.name) {
      console.error('Error name:', error.name);
    }
  }

  process.exit(0);
}

debugAuth();