const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'tutorsupportdb1',
  user: 'sa',
  password: '123456',
  options: { encrypt: false, trustServerCertificate: true }
};

sql.connect(config).then(async (pool) => {
  // Check AttendanceRecord columns
  const att = await pool.request().query(`
    SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'AttendanceRecord'
  `);
  console.log('=== AttendanceRecord Columns ===');
  att.recordset.forEach(r => console.log(r.COLUMN_NAME, '-', r.DATA_TYPE));

  // Check Schedule columns
  const sch = await pool.request().query(`
    SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Schedule'
  `);
  console.log('\n=== Schedule Columns ===');
  sch.recordset.forEach(r => console.log(r.COLUMN_NAME, '-', r.DATA_TYPE));

  // Sample AttendanceRecord data
  const sample = await pool.request().query('SELECT TOP 5 * FROM AttendanceRecord');
  console.log('\n=== Sample AttendanceRecord ===');
  console.log(JSON.stringify(sample.recordset, null, 2));

  // Sample Schedule data  
  const sampleSch = await pool.request().query('SELECT TOP 5 * FROM Schedule');
  console.log('\n=== Sample Schedule ===');
  console.log(JSON.stringify(sampleSch.recordset, null, 2));

  // Check a tutor's classes and schedules
  const tutorData = await pool.request().query(`
    SELECT c.class_id, c.tutor_id, c.student_id, c.hourly_price, c.status,
           s.schedule_id, s.day_of_week, s.start_time, s.end_time,
           u.name as student_name
    FROM Class c
    LEFT JOIN Schedule s ON c.class_id = s.class_id
    LEFT JOIN UserAccount u ON c.student_id = u.user_id
    WHERE c.tutor_id IS NOT NULL
  `);
  console.log('\n=== Tutor Classes with Schedules ===');
  console.log(JSON.stringify(tutorData.recordset.slice(0, 10), null, 2));

  sql.close();
}).catch(err => console.error(err));
