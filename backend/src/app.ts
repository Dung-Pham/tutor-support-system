/**
 * File: app.ts
 * Mục đích: Cấu hình Express application
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

// Import routes
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import conversationRoute from "./routes/conversationRoute.js";
import postRoute from "./routes/postRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import commentRoute from "./routes/commentRoute.js";
import adminRoute from "./routes/adminRoute.js";
import { protectedRoute } from "./middlewares/userMiddleware.js";

const app = express();

// Security & Performance Middlewares
app.use(helmet());

// CORS configuration
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
  })
);
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

// API Routes
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

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Internal Server Error", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export default app;
