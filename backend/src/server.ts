/**
 * File: server.ts
 * Mục đích: Entry point của backend server
 * Vai trò:
 *   - Khởi tạo và cấu hình HTTP server
 *   - Thiết lập Socket.IO cho realtime communication
 *   - Kết nối tới MongoDB và SQL Server
 *   - Quản lý vòng đời của server
 * Lưu ý:
 *   - Cần file .env với đầy đủ biến môi trường
 *   - MongoDB và SQL Server phải sẵn sàng trước khi start
 *   - Socket.IO events được định nghĩa trong config/socket.js
 */

// Load environment variables FIRST - this import MUST be first
import "dotenv/config";

import app from "./app.js";
import { createServer } from "http";
import connectMongoDB from "./config/mongodb.js";
import { connectSQLServer } from "./config/sqlserver.js";
import { initSocket } from "./config/socket.js";

const PORT = process.env.PORT || 5000;

// Tạo HTTP server từ Express app
const server = createServer(app);

/**
 * Hàm khởi động server
 * - Kết nối đến các database
 * - Khởi tạo Socket.IO
 * - Start HTTP server
 */
const startServer = async (): Promise<void> => {
  try {
    // Kết nối MongoDB
    await connectMongoDB();

    // Kết nối SQL Server
    await connectSQLServer();

    // Khởi tạo Socket.IO
    initSocket(server);

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 Socket.IO ready for connections`);
    });

    // Xử lý SIGTERM để graceful shutdown
    process.on("SIGTERM", () => {
      console.warn("🛑 SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("✅ Process terminated");
      });
    });

    // Xử lý unhandled promise rejection để tránh crash không mong muốn
    process.on(
      "unhandledRejection",
      (reason: unknown, promise: Promise<unknown>) => {
        console.error("❌ Unhandled Rejection", { promise, reason });
        server.close(() => {
          process.exit(1);
        });
      }
    );
  } catch (error) {
    const err = error as Error;
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
