import dbConnection from './src/database/connection';

async function checkSchema() {
  try {
    // Query all tables with 'homework' in name
    const tablesQuery = `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND (TABLE_NAME LIKE '%homework%' OR TABLE_NAME LIKE '%material%' OR TABLE_NAME LIKE '%submission%')
      ORDER BY TABLE_NAME
    `;

    const tables = await dbConnection.query<{ TABLE_NAME: string }>(tablesQuery);
    console.log('\n=== HOMEWORK-RELATED TABLES ===');
    console.log(tables.recordset.map(t => t.TABLE_NAME).join('\n'));

    // For each table, get columns
    for (const table of tables.recordset) {
      const columnsQuery = `
        SELECT 
          COLUMN_NAME, 
          DATA_TYPE, 
          IS_NULLABLE,
          COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${table.TABLE_NAME}'
        ORDER BY ORDINAL_POSITION
      `;

      const columns = await dbConnection.query<any>(columnsQuery);
      console.log(`\n--- Table: ${table.TABLE_NAME} ---`);
      columns.recordset.forEach(col => {
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${nullable})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSchema();
