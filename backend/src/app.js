/**
 * File: app.js
 * Mục đích: Cấu hình Express application
 * Vai trò:
 *   - Thiết lập middlewares (security, logging, parsing)
 *   - Đăng ký routes
 *   - Cấu hình Swagger documentation
 *   - Xử lý errors
 * Lưu ý:
 *   - Thứ tự middlewares quan trọng (security trước, error handler cuối)
 *   - CORS origin phải match với frontend URL
 *   - Tất cả routes đều có prefix /api
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import cookieParser from "cookie-parser";

// Import routes
// TODO: Add your routes here
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import friendRoute from "./routes/friendRoute.js";
import messageRoute from "./routes/messageRoute.js";
import { protectedRoute } from "./middlewares/userMiddleWare.js";

const app = express();

// Security & Performance Middlewares
app.use(helmet()); // Bảo vệ app khỏi các lỗ hổng web phổ biến
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(compression()); // Nén response để tăng tốc
app.use(morgan("dev")); // Log HTTP requests
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body
app.use(cookieParser()); // Parse cookies

// API Documentation - Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint - Kiểm tra server còn sống
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes - Tất cả routes đều có prefix /api
// TODO: Add your API routes here
// public routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute); // Move posts before protectedRoute

//private routes
app.use(protectedRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute); // Keep posts route for protected as well
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRoute);

// 404 Handler - Route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export default app;
