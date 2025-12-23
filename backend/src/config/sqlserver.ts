/**
 * File: sqlserver.ts
 * Mục đích: Cấu hình và kết nối SQL Server
 */

import { Sequelize } from "sequelize";

const instanceName = process.env.MSSQL_INSTANCE;

const sequelize = new Sequelize(
  process.env.MSSQL_DATABASE || "tutor_support_system",
  process.env.MSSQL_USER || "sa",
  process.env.MSSQL_PASSWORD || "",
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
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  }
);

const connectSQLServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✅ SQL Server Connected successfully");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ SQL Server Connection Error:", errorMessage);
    process.exit(1);
  }
};

export { sequelize, connectSQLServer };
