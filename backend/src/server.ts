/**
 * File: server.ts
 * Mục đích: Entry point - khởi động server
 */

// Load environment variables FIRST - this import MUST be first
import "./config/env.js";

import app from "./app.js";
import { createServer } from "http";
import connectMongoDB from "./config/mongodb.js";
import { connectSQLServer } from "./config/sqlserver.js";
import { initSocket } from "./config/socket.js";

const PORT = process.env.PORT || 5000;

// Connect to databases
const startServer = async (): Promise<void> => {
  try {
    // Connect MongoDB
    await connectMongoDB();

    // Connect SQL Server
    await connectSQLServer();

    const server = createServer(app);

    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 Socket.IO ready`);
    });

    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("✅ Process terminated");
      });
    });

    process.on(
      "unhandledRejection",
      (reason: unknown, promise: Promise<unknown>) => {
        console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
        server.close(() => {
          process.exit(1);
        });
      }
    );
  } catch (error) {
    const err = error as Error;
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
