// SQL Server Connection

import { Sequelize, Options } from 'sequelize';

// Helper function to read environment variables
function env(key: string): string | undefined {
  if (process.env[key] !== undefined) return process.env[key];
  const alt = key.replace(/^MSSQL_/, 'DB_');
  return process.env[alt];
}

const instanceName = env('MSSQL_INSTANCE');

const sequelize = new Sequelize(
  env('MSSQL_DATABASE') || 'tutorsupportdb2',
  env('MSSQL_USER') || 'sa',
  env('MSSQL_PASSWORD') || '12345',
  {
    host: env('MSSQL_HOST') || 'localhost',
    // Don't use port when using instanceName (SQL Browser will find port)
    ...(instanceName ? {} : { port: parseInt(env('MSSQL_PORT') || '1433') }),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: env('MSSQL_ENCRYPT') === 'true',
        trustServerCertificate: env('MSSQL_TRUST_SERVER_CERTIFICATE') !== 'false',
        enableArithAbort: true,
        requestTimeout: 30000,
        connectionTimeout: 30000,
        charset: 'UTF-8',
        ...(instanceName && { instanceName }),
      },
    },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(msg) : false,
  } as Options
);

const connectSQLServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('SQL Server Connected successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('SQL Server Connection Error: ' + errorMessage);
    process.exit(1);
  }
};

// Test connection function (from quynh)
async function testSQLServerConnection(): Promise<boolean> {
  console.log('Testing SQL Server connection...');
  try {
    await sequelize.authenticate();
    console.log('SQL Server connection test passed');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('SQL Server connection test failed: ' + errorMessage);
    return false;
  }
}

export { sequelize, connectSQLServer, testSQLServerConnection };
