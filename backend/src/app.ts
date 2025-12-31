/**
 * File: app.ts
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

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import path from "path";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

// ============================================
// Dang's Routes (Social features)
// ============================================
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import conversationRoute from "./routes/conversationRoute.js";
import postRoute from "./routes/postRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import commentRoute from "./routes/commentRoute.js";
import adminRoute from "./routes/adminRoute.js";
import { protectedRoute } from "./middlewares/userMiddleware.js";

// ============================================
// Dung's Routes (Teaching module)
// ============================================
import authRoutes from "./routes/auth.js";
import classRoutes from "./routes/classes.js";
import lessonPlanRoutes from "./routes/lessonPlans.js";
import homeworkRoutes from "./routes/homework.js";
import uploadRoutes from "./routes/upload.js";
import documentRoutes from "./routes/documents.js";
import studentRoutes from "./routes/students.js";
import statisticsRoutes from "./routes/statistics.js";
import scheduleRoutes from "./routes/schedules.js";
import attendanceRoutes from "./routes/attendance.js";

const app = express();

// ============================================================
// STATIC FILE SERVING - MUST BE BEFORE HELMET
// This allows PDF/images to be embedded in iframes without X-Frame-Options blocking
// ============================================================
app.use(
  "/uploads",
  (req, res, next): void => {
    // Set headers to allow cross-origin file viewing and iframe embedding
    const origin = req.headers.origin || "http://localhost:3000";
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range, Accept");
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range, Content-Disposition"
    );

    // Set Content-Disposition to inline for all viewable files
    const ext = path.extname(req.path).toLowerCase();
    if ([".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      res.setHeader("Content-Disposition", "inline");
    }

    // Handle OPTIONS preflight
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    next();
  },
  express.static(path.join(__dirname, "..", "uploads"), {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === ".pdf") {
        res.setHeader("Content-Type", "application/pdf");
      } else if ([".jpg", ".jpeg"].includes(ext)) {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (ext === ".png") {
        res.setHeader("Content-Type", "image/png");
      } else if (ext === ".gif") {
        res.setHeader("Content-Type", "image/gif");
      } else if (ext === ".webp") {
        res.setHeader("Content-Type", "image/webp");
      }
    },
  })
);

// CORS configuration - allow frontend and admin to access API
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  process.env.ADMIN_URL || "http://localhost:3002",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["Content-Disposition", "Content-Type"],
  })
);

// Security & Performance Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    frameguard: false,
  })
);
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger Documentation Setup
const swaggerDocument = JSON.parse(
  fs.readFileSync("./src/config/swagger.json", "utf-8")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Dang's Routes - Social Features
// ============================================
// Public routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api", commentRoute);

// Admin routes (has its own auth middleware)
app.use("/api/admin", adminRoute);

// Protected routes (with middleware)
app.use(protectedRoute);
app.use("/api/users", userRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/upload", uploadRoute);

// ============================================
// Dung's Routes - Teaching Module
// ============================================
app.use("/api/v2/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/lesson-plans", lessonPlanRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/v2/upload", uploadRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/attendance", attendanceRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler - Xử lý các loại lỗi khác nhau
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.message || err);

  // 1. Multer errors (file upload)
  if (err.name === "MulterError") {
    const multerMessages: Record<string, string> = {
      LIMIT_FILE_SIZE: "File vượt quá kích thước cho phép (tối đa 4MB)",
      LIMIT_FILE_COUNT: "Số lượng file vượt quá giới hạn (tối đa 10 files)",
      LIMIT_UNEXPECTED_FILE: "Trường file không hợp lệ",
    };
    return res.status(400).json({
      success: false,
      message: multerMessages[err.code] || "Lỗi upload file",
    });
  }

  // 2. Custom file type error từ multer fileFilter
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: "Chỉ chấp nhận file ảnh (jpg, png, gif, webp)",
    });
  }

  // 3. Sequelize UniqueConstraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    const fields = Object.keys(err.fields || {});
    const fieldName = fields[0] || "field";
    const fieldMap: Record<string, string> = {
      email: "Email",
      slug: "Đường dẫn bài viết",
      phone: "Số điện thoại",
    };
    return res.status(409).json({
      success: false,
      message: `${fieldMap[fieldName] || fieldName} đã tồn tại trong hệ thống`,
    });
  }

  // 4. MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `${field} đã tồn tại`,
    });
  }

  // 5. Default: Internal Server Error
  return res.status(500).json({
    success: false,
    message: "Lỗi hệ thống, vui lòng thử lại sau",
  });
});

export default app;
