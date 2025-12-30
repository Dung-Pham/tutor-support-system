import sql from 'mssql';

const config = {
  server: 'localhost',
  database: 'tutorsupportdb1',
  user: 'sa',
  password: '123456',
  options: { trustServerCertificate: true }
};

async function main() {
  await sql.connect(config);
  
  const tutorId = 'ADDF98ED-86F5-4B8E-BF94-4572A5B21C42'; // Trần Thị B
  
  console.log('=== TUTOR: Trần Thị B ===');
  console.log('TutorId:', tutorId);
  
  // Check classes
  console.log('\n=== CLASSES ===');
  const classes = await sql.query`
    SELECT c.class_id, c.status, c.hourly_price, s.name as subject_name
    FROM Class c
    INNER JOIN Subjects s ON c.subject_id = s.subject_id
    WHERE c.tutor_id = ${tutorId}
  `;
  console.log(classes.recordset);
  
  // Check schedules
  console.log('\n=== SCHEDULES ===');
  const schedules = await sql.query`
    SELECT s.schedule_id, s.class_id, s.day_of_week, s.start_time, s.duration_minutes, s.is_active, c.status as class_status
    FROM Schedule s
    INNER JOIN Class c ON s.class_id = c.class_id
    WHERE c.tutor_id = ${tutorId}
  `;
  console.log(schedules.recordset);
  
  // Check active schedules only
  console.log('\n=== ACTIVE SCHEDULES (class active + schedule active) ===');
  const activeSchedules = await sql.query`
    SELECT s.schedule_id, s.class_id, s.day_of_week, s.start_time, s.duration_minutes
    FROM Schedule s
    INNER JOIN Class c ON s.class_id = c.class_id
    WHERE c.tutor_id = ${tutorId}
      AND c.status = 'active'
      AND s.is_active = 1
  `;
  console.log(activeSchedules.recordset);
  
  // Calculate expected sessions for Dec 2025 - using correct formula
  console.log('\n=== EXPECTED SESSIONS (Dec 1-20, 2025) with CORRECT MAPPING ===');
  const expectedSessions = await sql.query`
    WITH DateRange AS (
      SELECT CAST('2025-12-01' AS DATE) AS d
      UNION ALL
      SELECT DATEADD(DAY, 1, d) FROM DateRange WHERE d < '2025-12-20'
    ),
    ActiveSchedules AS (
      SELECT s.day_of_week, c.hourly_price, s.duration_minutes
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
      DATEPART(WEEKDAY, dr.d) as sql_weekday,
      (DATEPART(WEEKDAY, dr.d) + 5) % 7 as old_formula,
      CASE WHEN DATEPART(WEEKDAY, dr.d) = 1 THEN 0 ELSE DATEPART(WEEKDAY, dr.d) - 1 END as new_formula,
      ISNULL((
        SELECT COUNT(*) FROM ActiveSchedules sch 
        WHERE sch.day_of_week = CASE WHEN DATEPART(WEEKDAY, dr.d) = 1 THEN 0 ELSE DATEPART(WEEKDAY, dr.d) - 1 END
      ), 0) as sessions,
      ISNULL((
        SELECT SUM(CAST(sch.hourly_price AS FLOAT) * sch.duration_minutes / 60.0) 
        FROM ActiveSchedules sch 
        WHERE sch.day_of_week = CASE WHEN DATEPART(WEEKDAY, dr.d) = 1 THEN 0 ELSE DATEPART(WEEKDAY, dr.d) - 1 END
      ), 0) as revenue
    FROM DateRange dr
    ORDER BY dr.d
    OPTION (MAXRECURSION 100)
  `;
  console.log(expectedSessions.recordset);
  
  process.exit(0);
}

main().catch(console.error);
