import sql from 'mssql';

const config = {
  server: 'localhost',
  database: 'tutorsupportdb1',
  user: 'sa',
  password: '123456',
  options: { encrypt: true, trustServerCertificate: true }
};

async function checkSchema() {
  try {
    const pool = await sql.connect(config);
    
    // Get all tables
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      ORDER BY TABLE_NAME
    `);
    
    console.log('=== TABLES ===');
    tablesResult.recordset.forEach(r => console.log(r.TABLE_NAME));
    
    // Get columns for important tables
    const importantTables = ['Class', 'Schedule', 'Homework', 'HomeworkAssignment', 'HomeworkSubmission', 'Documents', 'UserAccount'];
    
    for (const tableName of importantTables) {
      const columnsResult = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `);
      
      if (columnsResult.recordset.length > 0) {
        console.log(`\n=== ${tableName} ===`);
        columnsResult.recordset.forEach(r => console.log(`  ${r.COLUMN_NAME}: ${r.DATA_TYPE}`));
      }
    }
    
    await pool.close();
  } catch (err) {
    console.error(err);
  }
}

checkSchema();
