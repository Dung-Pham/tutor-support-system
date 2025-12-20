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

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import errorHandler from './middlewares/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import classRoutes from './routes/classes';
import lessonPlanRoutes from './routes/lessonPlans';
import homeworkRoutes from './routes/homework';
import uploadRoutes from './routes/upload';
import documentRoutes from './routes/documents';
import studentRoutes from './routes/students';

// Module VI - Teaching & Learning Support Routes
import scheduleRoutes from './routes/schedules';
// import rescheduleRoutes from './routes/reschedules'; // TODO: Fix type inconsistencies
import attendanceRoutes from './routes/attendance';
// import evaluationRoutes from './routes/evaluations'; // TODO: Fix type issues
// import homeworkRoutes from './routes/homework'; // TODO: Fix type issues
// import chatRoutes from './routes/chat'; // TODO: Fix type issues

const app = express();

// ============================================================
// STATIC FILE SERVING - MUST BE BEFORE HELMET
// This allows PDF/images to be embedded in iframes without X-Frame-Options blocking
// ============================================================
app.use('/uploads', (req, res, next): void => {
  // Set headers to allow cross-origin file viewing and iframe embedding
  const origin = req.headers.origin || 'http://localhost:3000';
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Disposition');
  
  // Set Content-Disposition to inline for all viewable files
  const ext = path.extname(req.path).toLowerCase();
  if (['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    res.setHeader('Content-Disposition', 'inline');
  }
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
}, express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.gif') {
      res.setHeader('Content-Type', 'image/gif');
    } else if (ext === '.webp') {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// CORS configuration - allow frontend to access API and files
// IMPORTANT: CORS must be before helmet for proper cross-origin file access
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type'],
}));

// Security & Performance Middlewares
// COMPLETELY DISABLE security headers that block PDF viewing
// This is safe for localhost development
app.use(helmet({
  contentSecurityPolicy: false,  // Disable CSP completely
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  frameguard: false,  // Disable X-Frame-Options completely
}));
app.use(compression()); // Nén response để tăng tốc
app.use(morgan('dev')); // Log HTTP requests
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

// API Documentation - Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint - Kiểm tra server còn sống
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes - Tất cả routes đều có prefix /api
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/students', studentRoutes);

// Module VI Routes - Teaching & Learning Support
app.use('/api/schedules', scheduleRoutes);
// app.use('/api/reschedules', rescheduleRoutes); // TODO: Fix type inconsistencies in rescheduleService
app.use('/api/attendance', attendanceRoutes);
// app.use('/api/evaluations', evaluationRoutes); // TODO: Fix type issues in evaluationService
// app.use('/api/homework', homeworkRoutes); // TODO: Fix type issues in homeworkService
// app.use('/api/chat', chatRoutes); // TODO: Fix type issues in chatService

// 404 Handler - Route không tồn tại
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler - Phải đặt cuối cùng
app.use(errorHandler);

export default app;
