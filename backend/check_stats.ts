const sql = require('mssql');
const config = {
  server: 'localhost',
  database: 'tutorsupportdb1',
  user: 'sa',
  password: '123456',
  options: { encrypt: false, trustServerCertificate: true }
};

async function check() {
  const pool = await sql.connect(config);
  
  // Check AttendanceRecord count
  const ar = await pool.request().query('SELECT COUNT(*) as cnt FROM AttendanceRecord');
  console.log('AttendanceRecord count:', ar.recordset[0].cnt);
  
  // Check Schedule
  const sch = await pool.request().query('SELECT COUNT(*) as cnt FROM Schedule');
  console.log('Schedule count:', sch.recordset[0].cnt);
  
  // Check Class for tutor
  const cls = await pool.request().query(`
    SELECT c.class_id, sub.name as subject, u.name as student, c.hourly_price, c.status
    FROM Class c
    JOIN Subjects sub ON c.subject_id = sub.subject_id
    JOIN UserAccount u ON c.student_id = u.user_id
    WHERE c.tutor_id IS NOT NULL
  `);
  console.log('Classes with tutor:', cls.recordset);
  
  // Check Schedule days
  const schDays = await pool.request().query(`
    SELECT s.class_id, s.day_of_week, s.duration_minutes, s.is_active
    FROM Schedule s
    JOIN Class c ON s.class_id = c.class_id
    WHERE c.tutor_id IS NOT NULL
  `);
  console.log('Schedule days:', schDays.recordset);
  
  // Check attendance in December
  const arDec = await pool.request().query(`
    SELECT COUNT(*) as cnt 
    FROM AttendanceRecord ar 
    WHERE ar.session_date >= '2025-12-01'
  `);
  console.log('Attendance in Dec:', arDec.recordset[0].cnt);
  
  // Get sample attendance
  const arSample = await pool.request().query(`
    SELECT TOP 5 * FROM AttendanceRecord ORDER BY session_date DESC
  `);
  console.log('Sample attendance:', arSample.recordset);
  
  pool.close();
}
check().catch(console.error);
