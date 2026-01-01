// SQL Server Connection

import { Sequelize } from "sequelize";

// Validate required environment variables
const requiredEnvVars = ["MSSQL_DATABASE", "MSSQL_USER", "MSSQL_PASSWORD"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required SQL Server environment variables: ${missingEnvVars.join(
      ", "
    )}`
  );
}

const instanceName = process.env.MSSQL_INSTANCE;

const sequelize = new Sequelize(
  process.env.MSSQL_DATABASE!,
  process.env.MSSQL_USER!,
  process.env.MSSQL_PASSWORD!,
  {
    host: process.env.MSSQL_HOST || "localhost",
    // Không dùng port khi có instanceName (SQL Browser sẽ tìm port)
    ...(instanceName
      ? {}
      : { port: parseInt(process.env.MSSQL_PORT || "1433") }),
    dialect: "mssql",
    dialectOptions: {
      options: {
        encrypt: process.env.MSSQL_ENCRYPT === "true",
        trustServerCertificate:
          process.env.MSSQL_TRUST_SERVER_CERTIFICATE === "true",
        // Named instance support
        ...(instanceName && { instanceName }),
      },
    },
    logging:
      process.env.NODE_ENV === "development"
        ? (msg) => console.log(msg)
        : false,
  }
);

const connectSQLServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✅ SQL Server Connected successfully");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ SQL Server Connection Error: ${errorMessage}`);
    process.exit(1);
  }
};

export { sequelize, connectSQLServer };
