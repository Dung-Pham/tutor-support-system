/**
 * Script để update tất cả mật khẩu trong table UserAccount thành hash của "123456"
 * Hash: $2a$10$tq4qylJ7UCMfSf2f4of6reoNyd59oZLdkZf62Eeft2yzn3v6MaZvm
 */

const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || '123456',
  server: process.env.MSSQL_HOST || 'localhost',
  database: process.env.MSSQL_DATABASE || 'tutorsupportdb0_2',
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const NEW_PASSWORD_HASH = '$2a$10$tq4qylJ7UCMfSf2f4of6reoNyd59oZLdkZf62Eeft2yzn3v6MaZvm';

async function updatePasswords() {
  try {
    console.log('🔄 Kết nối đến database...');
    await sql.connect(config);
    console.log('✅ Đã kết nối thành công');

    // Update tất cả mật khẩu
    console.log('🔄 Đang update mật khẩu...');
    const updateQuery = `
      UPDATE [UserAccount]
      SET password_hash = '${NEW_PASSWORD_HASH}',
          updated_at = GETDATE()
      WHERE password_hash IS NOT NULL
    `;

    const result = await sql.query(updateQuery);
    console.log(`✅ Đã update ${result.rowsAffected[0]} tài khoản`);

    // Hiển thị danh sách users
    console.log('📋 Danh sách users sau khi update:');
    const usersQuery = `
      SELECT user_id, email, name, role, status
      FROM [UserAccount]
      ORDER BY created_at DESC
    `;

    const usersResult = await sql.query(usersQuery);
    console.table(usersResult.recordset);

    console.log('🎉 Hoàn thành! Tất cả mật khẩu đã được đổi thành hash của "123456"');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await sql.close();
    console.log('🔌 Đã đóng kết nối database');
  }
}

// Chạy script
updatePasswords();