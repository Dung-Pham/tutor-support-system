const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MSSQL_DATABASE || 'tutorsupportdb2',
  process.env.MSSQL_USER || 'sa',
  process.env.MSSQL_PASSWORD || '12345',
  {
    host: process.env.MSSQL_HOST || 'localhost',
    port: parseInt(process.env.MSSQL_PORT || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    },
    logging: false,
  }
);

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to SQL Server!');
    console.log('📦 Database:', process.env.MSSQL_DATABASE || 'tutorsupportdb2');
    
    // Get all tables
    const [tables] = await sequelize.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME");
    console.log('\n📊 TABLES (' + tables.length + '):');
    tables.forEach((t, i) => console.log('  ' + (i+1) + '. ' + t.TABLE_NAME));
    
    // Get all views
    const [views] = await sequelize.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS ORDER BY TABLE_NAME");
    console.log('\n👁 VIEWS (' + views.length + '):');
    views.forEach((v, i) => console.log('  ' + (i+1) + '. ' + v.TABLE_NAME));
    
    // Get stored procedures
    const [procs] = await sequelize.query("SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' ORDER BY ROUTINE_NAME");
    console.log('\n⚙️ STORED PROCEDURES (' + procs.length + '):');
    procs.forEach((p, i) => console.log('  ' + (i+1) + '. ' + p.ROUTINE_NAME));
    
    // Sample: Count rows in key tables
    console.log('\n📈 ROW COUNTS:');
    const keyTables = ['UserAccount', 'Class', 'TutorProfile', 'StudentProfile', 'TutorApplication', 'Notifications', 'Conversations', 'PostHeaders'];
    for (const table of keyTables) {
      try {
        const [[result]] = await sequelize.query('SELECT COUNT(*) as count FROM ' + table);
        console.log('  ' + table + ': ' + result.count + ' rows');
      } catch(e) {
        console.log('  ' + table + ': (error)');
      }
    }
    
    await sequelize.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();
