import dotenv from "dotenv";
import app from "./app.js";
import { createServer } from "http";
import connectMongoDB from "./config/mongodb.js";
import { initSocket } from "./config/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectMongoDB();

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

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  server.close(() => {
    process.exit(1);
  });
});
