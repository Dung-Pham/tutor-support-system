/**
 * File: server.js
 * Mục đích: Entry point của ứng dụng
 * Vai trò:
 *   - Khởi động HTTP server
 *   - Kết nối database (nếu cần)
 *   - Khởi tạo Socket.IO (nếu cần)
 */

import dotenv from "dotenv";
import app from "./app.js";
import { createServer } from "http";
import connectMongoDB from "./config/mongodb.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Kết nối MongoDB
connectMongoDB();

// Tạo HTTP server
const server = createServer(app);

// Khởi động server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Xử lý graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("✅ Process terminated");
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  server.close(() => {
    process.exit(1);
  });
});
