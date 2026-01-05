const sql = require('mssql');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const config = {
  user: 'sa',
  password: '123',
  server: 'localhost\\DANGSERVER',
  database: 'tutorsupportdb2',
  options: { encrypt: true, trustServerCertificate: true }
};

async function createAdmin() {
  const pool = await sql.connect(config);
  const userId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash('123456', 10);
  
  // Check if admin already exists
  const existing = await pool.request()
    .input('email', sql.NVarChar, 'admin@gmail.com')
    .query('SELECT user_id FROM UserAccount WHERE email = @email');
  
  if (existing.recordset.length > 0) {
    console.log('Admin already exists! Updating password...');
    await pool.request()
      .input('email', sql.NVarChar, 'admin@gmail.com')
      .input('password_hash', sql.NVarChar, passwordHash)
      .query('UPDATE UserAccount SET password_hash = @password_hash WHERE email = @email');
    console.log('Password updated!');
  } else {
    await pool.request()
      .input('user_id', sql.UniqueIdentifier, userId)
      .input('email', sql.NVarChar, 'admin@gmail.com')
      .input('password_hash', sql.NVarChar, passwordHash)
      .input('name', sql.NVarChar, 'Admin')
      .input('role', sql.NVarChar, 'admin')
      .input('status', sql.Bit, 1)
      .input('is_verified', sql.Bit, 1)
      .query(`
        INSERT INTO UserAccount (user_id, email, password_hash, name, role, status, is_verified, created_at, updated_at)
        VALUES (@user_id, @email, @password_hash, @name, @role, @status, @is_verified, GETDATE(), GETDATE())
      `);
    console.log('Admin created successfully!');
    console.log('User ID:', userId);
  }
  
  console.log('\n=============================');
  console.log('Email: admin@gmail.com');
  console.log('Password: 123456');
  console.log('=============================');
  
  pool.close();
}

createAdmin().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
