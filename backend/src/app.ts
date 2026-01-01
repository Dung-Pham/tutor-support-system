import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import Error Handler from HEAD
import { errorHandler } from './middlewares/errorHandler.js';
// Import Protected Route middleware from dang
import { protectedRoute } from './middlewares/protectedRoute.js';

// ============================================
// HEAD Routes - Teaching Module
// ============================================
import authRoutes from './routes/auth.js';
import classRoutes from './routes/classes.js';
import lessonPlanRoutes from './routes/lessonPlans.js';
import homeworkRoutes from './routes/homework.js';
import uploadRoutes from './routes/upload.js';
import documentRoutes from './routes/documents.js';
import studentRoutes from './routes/students.js';
import statisticsRoutes from './routes/statistics.js';
import scheduleRoutes from './routes/schedules.js';
import attendanceRoutes from './routes/attendance.js';

// ============================================
// dang Routes - Social Module
// ============================================
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import messageRoute from './routes/messageRoute.js';
import conversationRoute from './routes/conversationRoute.js';
import postRoute from './routes/postRoute.js';
import commentRoute from './routes/commentRoute.js';
import adminRoute from './routes/adminRoute.js';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware (from HEAD - disabled for development)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());

// Static files for uploads (from HEAD)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// CORS Configuration (merged from both)
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        undefined, // for same-origin requests
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger Documentation Setup (from dang)
const swaggerDocument = JSON.parse(
  fs.readFileSync('./src/config/swagger.json', 'utf-8')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint (merged)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API Routes
// ============================================

// --- Public Routes ---
// Auth routes (both branches - use HEAD's auth for now, can switch to dang's authRoute)
app.use('/api/auth', authRoutes);
// Social public routes (from dang)
app.use('/api/posts', postRoute);
app.use('/api', commentRoute);

// --- Admin Routes (from dang - has its own auth middleware) ---
app.use('/api/admin', adminRoute);

// --- Teaching Module Routes (from HEAD) ---
app.use('/api/classes', classRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/attendance', attendanceRoutes);

// --- Protected Routes (from dang - with middleware) ---
app.use(protectedRoute);
app.use('/api/users', userRoute);
app.use('/api/messages', messageRoute);
app.use('/api/conversations', conversationRoute);

// ============================================
// Error Handling
// ============================================

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler (merged from both - comprehensive version from dang)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message || err);

  // 1. Multer errors (file upload)
  if (err.name === 'MulterError') {
    const multerMessages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'File vượt quá kích thước cho phép (tối đa 4MB)',
      LIMIT_FILE_COUNT: 'Số lượng file vượt quá giới hạn (tối đa 10 files)',
      LIMIT_UNEXPECTED_FILE: 'Trường file không hợp lệ',
    };
    return res.status(400).json({
      success: false,
      message: multerMessages[err.code] || 'Lỗi upload file',
    });
  }

  // 2. Custom file type error from multer fileFilter
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Chỉ chấp nhận file ảnh (jpg, png, gif, webp)',
    });
  }

  // 3. Sequelize UniqueConstraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = Object.keys(err.fields || {});
    const fieldName = fields[0] || 'field';
    const fieldMap: Record<string, string> = {
      email: 'Email',
      slug: 'Đường dẫn bài viết',
      phone: 'Số điện thoại',
    };
    return res.status(409).json({
      success: false,
      message: ${fieldMap[fieldName] || fieldName} đã tồn tại trong hệ thống,
    });
  }

  // 4. MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: ${field} đã tồn tại,
    });
  }

  // 5. Default: Internal Server Error
  res.status(500).json({
    success: false,
    message: 'Lỗi hệ thống, vui lòng thử lại sau',
  });
});

export default app;
