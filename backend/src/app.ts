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
import cloudinaryUploadRoute from "./routes/uploadRoute.js";

// Import Error Handler
import errorHandler from './middlewares/errorHandler.js';
// Import Protected Route middleware from dang
import { protectedRoute } from './middlewares/userMiddleware.js';

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
import tutorRoutes from './routes/tutors.js';
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

// ============================================
// quynh Routes - Student/Tutor Management Module
// ============================================
import locationRoutes from './routes/locationRoutes.js';
import subjectsRoutes from './routes/subjectsRoutes.js';
import notificationRoutes from './routes/NotificationRoutes.js';
// Routes for Student module
import studentManageRoutes from './routes/Student/studentRouter.js';
// Routes for Tutor module
import tutorManageRoutes from './routes/Tutor/tutorRoutes.js';
import applicationRoutes from './routes/Tutor/applicationRoutes.js';
import searchRoutes from './routes/Tutor/searchRoutes.js';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware (disabled for development)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());

// CORS Configuration - MUST be before static files
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [];
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  ...corsOrigins,
  undefined,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Static files for uploads - AFTER CORS middleware
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Swagger Documentation Setup
const swaggerDocument = JSON.parse(
  fs.readFileSync('./src/config/swagger.json', 'utf-8')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
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
app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoute);

// Social public routes (from dang)
app.use('/api/posts', postRoute);
app.use('/api', commentRoute);

// Location and Subjects (from quynh)
app.use('/api/locations', locationRoutes);
app.use('/api/subjects', subjectsRoutes);

// --- Admin Routes ---
app.use('/api/admin', adminRoute);

// --- Teaching Module Routes ---
app.use('/api/classes', classRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/upload-cloudinary', cloudinaryUploadRoute);
app.use('/api/documents', documentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/attendance', attendanceRoutes);

// --- Student/Tutor Management Routes (from quynh) ---
app.use('/api/student', studentManageRoutes);
app.use('/api/tutor', tutorManageRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Protected Routes (from dang) ---
app.use(protectedRoute);
app.use('/api/users', userRoute);
app.use('/api/messages', messageRoute);
app.use('/api/conversations', conversationRoute);

console.log('All routes mounted!');

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

// Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message || err);

  if (err.name === 'MulterError') {
    const multerMessages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'File vuot qua kich thuoc cho phep (toi da 4MB)',
      LIMIT_FILE_COUNT: 'So luong file vuot qua gioi han (toi da 10 files)',
      LIMIT_UNEXPECTED_FILE: 'Truong file khong hop le',
    };
    res.status(400).json({
      success: false,
      message: multerMessages[err.code] || 'Loi upload file',
    });
    return;
  }

  if (err.message === 'Only image files are allowed') {
    res.status(400).json({
      success: false,
      message: 'Chi chap nhan file anh (jpg, png, gif, webp)',
    });
    return;
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = Object.keys(err.fields || {});
    const fieldName = fields[0] || 'field';
    res.status(409).json({
      success: false,
      message: fieldName + ' da ton tai trong he thong',
    });
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    res.status(409).json({
      success: false,
      message: field + ' da ton tai',
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Loi he thong, vui long thu lai sau',
  });
  return;
});

export default app;
