const sql = require('mssql');

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

async function checkUser() {
  const pool = await sql.connect(config);
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, 'AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA')
    .query('SELECT user_id, email, name, role FROM [UserAccount] WHERE user_id = @userId');
  console.log('User found:', result.recordset);
  await pool.close();
}

checkUser().catch(console.error);
