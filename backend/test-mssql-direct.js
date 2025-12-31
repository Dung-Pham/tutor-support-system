/**
 * Simple MSSQL connection test without Sequelize
 */
const sql = require('mssql');
require('dotenv').config();

async function testConnection() {
  // Try multiple connection methods
  const configs = [
    // Method 1: localhost with instance name
    {
      name: 'localhost + instanceName',
      config: {
        server: 'localhost',
        database: process.env.MSSQL_DATABASE || 'tutorsupportdb',
        user: process.env.MSSQL_USER || 'sa',
        password: process.env.MSSQL_PASSWORD,
        options: {
          encrypt: true,
          trustServerCertificate: true,
          enableArithAbort: true,
          instanceName: 'TSSERVER'
        }
      }
    },
    // Method 2: localhost\TSSERVER format
    {
      name: 'localhost\\\\TSSERVER',
      config: {
        server: 'localhost\\TSSERVER',
        database: process.env.MSSQL_DATABASE || 'tutorsupportdb',
        user: process.env.MSSQL_USER || 'sa',
        password: process.env.MSSQL_PASSWORD,
        options: {
          encrypt: true,
          trustServerCertificate: true,
          enableArithAbort: true
        }
      }
    },
    // Method 3: . (local) with instance
    {
      name: '.\\\\TSSERVER',
      config: {
        server: '.\\TSSERVER',
        database: process.env.MSSQL_DATABASE || 'tutorsupportdb',
        user: process.env.MSSQL_USER || 'sa',
        password: process.env.MSSQL_PASSWORD,
        options: {
          encrypt: true,
          trustServerCertificate: true,
          enableArithAbort: true
        }
      }
    },
    // Method 4: (local) with instance
    {
      name: '(local)\\\\TSSERVER',
      config: {
        server: '(local)\\TSSERVER',
        database: process.env.MSSQL_DATABASE || 'tutorsupportdb',
        user: process.env.MSSQL_USER || 'sa',
        password: process.env.MSSQL_PASSWORD,
        options: {
          encrypt: true,
          trustServerCertificate: true,
          enableArithAbort: true
        }
      }
    }
  ];
  
  console.log('\n🔄 Testing SQL Server Connection with mssql library...\n');
  console.log('Trying multiple connection methods...\n');
  
  for (const {name, config} of configs) {
    console.log(`\nTrying: ${name}`);
    console.log('Server:', config.server);
    
    try {
      const pool = await sql.connect(config);
      console.log('✅ Connected successfully with method:', name);
      
      // Test query
      const result = await pool.request().query('SELECT @@VERSION as version, DB_NAME() as database_name');
      console.log('\nServer version:', result.recordset[0].version.split('\n')[0]);
      console.log('Database:', result.recordset[0].database_name);
      
      // List tables
      const tables = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);
      
      console.log(`\n📊 Found ${tables.recordset.length} tables:`);
      tables.recordset.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.TABLE_NAME}`);
      });
      
      console.log('\n🎉 Working connection string:');
      console.log(`   MSSQL_HOST=${config.server}`);
      if (config.options.instanceName) {
        console.log(`   MSSQL_INSTANCE=${config.options.instanceName}`);
      }
      
      await pool.close();
      console.log('\n✅ Test complete!\n');
      return;
      
    } catch (err) {
      console.log(`   ✗ Failed: ${err.message}`);
      continue;
    }
  }
  
  console.error('\n❌ All connection methods failed!');
  console.error('\nTroubleshooting:');
  console.error('1. Open SQL Server Configuration Manager');
  console.error('2. Go to: SQL Server Network Configuration > Protocols for TSSERVER');
  console.error('3. Enable TCP/IP protocol');
  console.error('4. Restart SQL Server (TSSERVER) service');
  console.error('\nOr try connecting with Named Pipes (already enabled by default)');
  process.exit(1);
}

testConnection();
