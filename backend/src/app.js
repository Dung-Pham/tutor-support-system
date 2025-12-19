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
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

// Import routes
// TODO: Add your routes here
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import conversationRoute from "./routes/conversationRoute.js";
import postRoute from "./routes/postRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import commentRoute from "./routes/commentRoute.js";
import { protectedRoute } from "./middlewares/userMiddleware.js";

const app = express();

// Security & Performance Middlewares
app.use(helmet()); // Bảo vệ app khỏi các lỗ hổng web phổ biến

// CORS configuration - allow both frontend and admin
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  process.env.ADMIN_URL || "http://localhost:3002",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev")); // Log HTTP requests
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body
app.use(cookieParser()); // Parse cookies

// Swagger Documentation Setup
const swaggerDocument = JSON.parse(
  fs.readFileSync("./src/config/swagger.json", "utf-8")
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
app.use("/api/posts", postRoute);
app.use("/api", commentRoute); // Comment và Like routes

// Protected routes (with middleware)
app.use(protectedRoute);
app.use("/api/users", userRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/upload", uploadRoute); // Cloudinary upload route

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
