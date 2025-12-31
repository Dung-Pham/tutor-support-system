const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'tutorsupportdb1',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function checkSchema() {
  try {
    const pool = await sql.connect(config);
    
    // Get all tables
    console.log('=== ALL TABLES ===');
    const tables = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
    `);
    tables.recordset.forEach(t => console.log(t.TABLE_NAME));
    
    // Get columns for homework-related tables
    const homeworkTables = ['Homework', 'HomeworkAssignment', 'HomeworkSubmission', 'Class', 'ClassStudent', 'UserAccount'];
    
    for (const tableName of homeworkTables) {
      console.log(`\n=== ${tableName} COLUMNS ===`);
      const cols = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `);
      if (cols.recordset.length === 0) {
        console.log('Table not found');
      } else {
        cols.recordset.forEach(c => {
          const len = c.CHARACTER_MAXIMUM_LENGTH ? `(${c.CHARACTER_MAXIMUM_LENGTH})` : '';
          console.log(`  ${c.COLUMN_NAME}: ${c.DATA_TYPE}${len} ${c.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
      }
    }
    
    await sql.close();
  } catch (err) {
    console.error('Error:', err.message);
    await sql.close();
  }
}

checkSchema();
