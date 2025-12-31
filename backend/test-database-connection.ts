/**
 * File: test-database-connection.ts
 * Purpose: Test SQL Server connection and run seed data
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

import { sequelize } from './src/config/sqlserver';
import * as fs from 'fs';

async function testConnection() {
  try {
    console.log('\n🔄 Testing SQL Server Connection...\n');
    
    // Test authentication
    await sequelize.authenticate();
    console.log('✅ SQL Server Connected successfully');
    console.log(`📦 Database: ${process.env.MSSQL_DATABASE}`);
    console.log(`🖥️  Host: ${process.env.MSSQL_HOST}:${process.env.MSSQL_PORT}`);
    console.log(`👤 User: ${process.env.MSSQL_USER}\n`);
    
    // Check if tables exist
    const [tables]: any = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_CATALOG = '${process.env.MSSQL_DATABASE}'
      ORDER BY TABLE_NAME
    `);
    
    console.log(`📊 Found ${tables.length} tables:`);
    tables.forEach((table: any, index: number) => {
      console.log(`   ${index + 1}. ${table.TABLE_NAME}`);
    });
    
    // Count records in main tables
    console.log('\n📈 Record counts:');
    const tablesToCheck = ['User', 'Class', 'Schedule', 'AttendanceRecord', 'Material', 'Homework', 'HomeworkSubmission'];
    
    for (const table of tablesToCheck) {
      try {
        const [result]: any = await sequelize.query(`SELECT COUNT(*) as count FROM [${table}]`);
        console.log(`   ${table}: ${result[0].count} records`);
      } catch (err) {
        console.log(`   ${table}: Table not found or error`);
      }
    }
    
    console.log('\n✅ Database connection test complete!\n');
    
  } catch (error: any) {
    console.error('\n❌ Connection Error:', error.message);
    console.error('\n📝 Troubleshooting:');
    console.error('   1. Check if SQL Server is running');
    console.error('   2. Verify .env file settings:');
    console.error(`      - MSSQL_HOST=${process.env.MSSQL_HOST}`);
    console.error(`      - MSSQL_PORT=${process.env.MSSQL_PORT}`);
    console.error(`      - MSSQL_DATABASE=${process.env.MSSQL_DATABASE}`);
    console.error(`      - MSSQL_USER=${process.env.MSSQL_USER}`);
    console.error('   3. Make sure database exists (run SQLTSSupportServer.sql first)');
    console.error('   4. Check firewall settings');
    console.error('\n');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function runSeedData() {
  try {
    console.log('\n🌱 Running seed data...\n');
    
    const seedFilePath = path.join(__dirname, 'seed_data.sql');
    
    if (!fs.existsSync(seedFilePath)) {
      console.error('❌ seed_data.sql not found!');
      process.exit(1);
    }
    
    const seedSQL = fs.readFileSync(seedFilePath, 'utf-8');
    
    // Split by GO statements (SQL Server batch separator)
    const batches = seedSQL
      .split(/\nGO\s*\n/gi)
      .filter(batch => batch.trim().length > 0)
      .filter(batch => !batch.trim().startsWith('--') || batch.includes('INSERT') || batch.includes('DELETE'));
    
    console.log(`📦 Executing ${batches.length} SQL batches...\n`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch) {
        try {
          await sequelize.query(batch);
          // Show progress for important operations
          if (batch.includes('INSERT INTO')) {
            const match = batch.match(/INSERT INTO \[(\w+)\]/);
            if (match) {
              console.log(`   ✓ Inserted data into ${match[1]}`);
            }
          } else if (batch.includes('DELETE FROM')) {
            const match = batch.match(/DELETE FROM \[(\w+)\]/);
            if (match) {
              console.log(`   ✓ Cleared ${match[1]}`);
            }
          }
        } catch (err: any) {
          console.error(`   ✗ Error in batch ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('\n✅ Seed data executed successfully!\n');
    
    // Show summary
    await testConnection();
    
  } catch (error: any) {
    console.error('\n❌ Seed Error:', error.message);
    process.exit(1);
  }
}

// Main execution
const command = process.argv[2];

if (command === 'seed') {
  runSeedData();
} else {
  testConnection();
}
