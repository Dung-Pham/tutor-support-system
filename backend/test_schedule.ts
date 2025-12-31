import sql from 'mssql';

const config = {
  server: 'localhost',
  database: 'tutorsupportdb1',
  user: 'sa',
  password: '123456',
  options: { encrypt: false, trustServerCertificate: true }
};

async function test() {
  await sql.connect(config);
  
  // Find tutors with classes
  console.log('=== ALL TUTORS WITH CLASSES ===');
  const tutors = await sql.query`
    SELECT DISTINCT c.tutor_id, u.name, u.email, COUNT(c.class_id) as class_count
    FROM Class c
    INNER JOIN UserAccount u ON c.tutor_id = u.user_id
    GROUP BY c.tutor_id, u.name, u.email
  `;
  console.log(tutors.recordset);
  
  // Get first tutor with classes
  const firstTutor = tutors.recordset[0];
  if (!firstTutor) {
    console.log('No tutors with classes found!');
    process.exit(0);
  }
  
  const tutorId = firstTutor.tutor_id;
  console.log('\n=== USING TUTOR:', tutorId, firstTutor.name, '===');
  
  // Test JavaScript getDay() mapping
  console.log('\n=== JAVASCRIPT getDay() MAPPING ===');
  const testDates = [
    new Date('2025-12-01'), // Monday
    new Date('2025-12-02'), // Tuesday
    new Date('2025-12-03'), // Wednesday
    new Date('2025-12-04'), // Thursday
    new Date('2025-12-05'), // Friday
    new Date('2025-12-06'), // Saturday
    new Date('2025-12-07'), // Sunday
  ];
  for (const d of testDates) {
    console.log(`${d.toISOString().split('T')[0]}: getDay()=${d.getDay()}`);
  }
  
  // 0. Check Classes for this tutor
  console.log('\n=== CLASSES ===');
  const classes = await sql.query`
    SELECT c.class_id, c.status, c.student_id, c.hourly_price
    FROM Class c
    WHERE c.tutor_id = ${tutorId}
  `;
  console.log(classes.recordset);
  
  // 1. Check all Schedules for this tutor (regardless of class status)
  console.log('\n=== ALL SCHEDULES ===');
  const allSchedules = await sql.query`
    SELECT s.schedule_id, s.class_id, s.day_of_week, s.is_active, c.status as class_status
    FROM Schedule s
    INNER JOIN Class c ON s.class_id = c.class_id
    WHERE c.tutor_id = ${tutorId}
  `;
  console.log(allSchedules.recordset);
  
  // 1b. Check Schedule data
  console.log('\n=== SCHEDULES (active only) ===');
  const schedules = await sql.query`
    SELECT s.schedule_id, s.class_id, s.day_of_week, s.is_active
    FROM Schedule s
    INNER JOIN Class c ON s.class_id = c.class_id
    WHERE c.tutor_id = ${tutorId}
    AND c.status = 'active'
    AND s.is_active = 1
  `;
  console.log(schedules.recordset);
  
  // 2. Check weekday mapping for December 2025
  console.log('\n=== WEEKDAY MAPPING ===');
  const weekdays = await sql.query`
    SELECT 
      CAST('2025-12-01' AS DATE) as d, DATEPART(WEEKDAY, '2025-12-01') as wd, DATENAME(WEEKDAY, '2025-12-01') as name
    UNION ALL SELECT CAST('2025-12-02' AS DATE), DATEPART(WEEKDAY, '2025-12-02'), DATENAME(WEEKDAY, '2025-12-02')
    UNION ALL SELECT CAST('2025-12-03' AS DATE), DATEPART(WEEKDAY, '2025-12-03'), DATENAME(WEEKDAY, '2025-12-03')
    UNION ALL SELECT CAST('2025-12-04' AS DATE), DATEPART(WEEKDAY, '2025-12-04'), DATENAME(WEEKDAY, '2025-12-04')
    UNION ALL SELECT CAST('2025-12-05' AS DATE), DATEPART(WEEKDAY, '2025-12-05'), DATENAME(WEEKDAY, '2025-12-05')
    UNION ALL SELECT CAST('2025-12-06' AS DATE), DATEPART(WEEKDAY, '2025-12-06'), DATENAME(WEEKDAY, '2025-12-06')
    UNION ALL SELECT CAST('2025-12-07' AS DATE), DATEPART(WEEKDAY, '2025-12-07'), DATENAME(WEEKDAY, '2025-12-07')
  `;
  console.log(weekdays.recordset);
  
  // 3. Calculate expected sessions for Dec 2025
  console.log('\n=== EXPECTED SESSIONS (Dec 1-20, 2025) ===');
  const expectedSessions = await sql.query`
    WITH DateRange AS (
      SELECT CAST('2025-12-01' AS DATE) as d
      UNION ALL
      SELECT DATEADD(DAY, 1, d) FROM DateRange WHERE d < '2025-12-20'
    ),
    TutorSchedules AS (
      SELECT s.day_of_week, c.hourly_price
      FROM Schedule s
      INNER JOIN Class c ON s.class_id = c.class_id
      WHERE c.tutor_id = ${tutorId}
      AND c.status = 'active'
      AND s.is_active = 1
    )
    SELECT 
      dr.d,
      FORMAT(dr.d, 'dd/MM') as label,
      DATENAME(WEEKDAY, dr.d) as weekday_name,
      DATEPART(WEEKDAY, dr.d) - 1 as calculated_day_of_week,
      COUNT(ts.day_of_week) as sessions,
      ISNULL(SUM(ts.hourly_price), 0) as revenue
    FROM DateRange dr
    LEFT JOIN TutorSchedules ts ON ts.day_of_week = DATEPART(WEEKDAY, dr.d) - 1
    GROUP BY dr.d
    ORDER BY dr.d
    OPTION (MAXRECURSION 31)
  `;
  console.log(expectedSessions.recordset);
  
  // 4. Summary
  const total = expectedSessions.recordset.reduce((sum: number, r: any) => sum + r.sessions, 0);
  console.log('\n=== TOTAL SESSIONS ===', total);
  
  process.exit(0);
}

test().catch(console.error);
