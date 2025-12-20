const jwt = require('jsonwebtoken');
const sql = require('mssql');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

async function generateTokens() {
  try {
    await sql.connect(config);

    // Get all users
    const result = await sql.query(`
      SELECT TOP 10 user_id, email, name, role
      FROM UserAccount
      WHERE status = 1
      ORDER BY created_at DESC
    `);

    console.log('🔑 JWT Tokens for real users in database tutorsupportdb1:');
    console.log('=' .repeat(80));

    result.recordset.forEach((user, index) => {
      const token = jwt.sign({
        userId: user.user_id,
        email: user.email,
        role: user.role
      }, JWT_SECRET, { expiresIn: '24h' });

      console.log(`${index + 1}. ${user.name} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   UserID: ${user.user_id}`);
      console.log(`   Token: Bearer ${token}`);
      console.log('');
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    sql.close();
  }
}

generateTokens();