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

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
let userRoutes = null;
let sessionRoutes = null;
let classRoutes = null;
let authRoutes = null;
let scheduleRoutes = null;
let attendanceRoutes = null;
let evaluationRoutes = null;
let documentRoutes = null;

try {
  const userModule = require('./routes/users');
  userRoutes = userModule.default || userModule;
} catch (e) {
  console.warn('User routes not available:', e.message);
}

try {
  const sessionModule = require('./routes/sessions');
  sessionRoutes = sessionModule.default || sessionModule;
} catch (e) {
  console.warn('Session routes not available:', e.message);
}

try {
  const classModule = require('./routes/classes');
  classRoutes = classModule.default || classModule;
} catch (e) {
  console.warn('Class routes not available:', e.message);
}

try {
  const authModule = require('./routes/auth');
  authRoutes = authModule.default || authModule;
} catch (e) {
  console.warn('Auth routes not available:', e.message);
}

try {
  const scheduleModule = require('./routes/schedules');
  scheduleRoutes = scheduleModule.default || scheduleModule;
} catch (e) {
  console.warn('Schedule routes not available:', e.message);
}

try {
  const attendanceModule = require('./routes/attendance');
  attendanceRoutes = attendanceModule.default || attendanceModule;
} catch (e) {
  console.warn('Attendance routes not available:', e.message);
}

try {
  const evaluationModule = require('./routes/evaluations');
  evaluationRoutes = evaluationModule.default || evaluationModule;
} catch (e) {
  console.warn('Evaluation routes not available:', e.message);
}

try {
  const documentModule = require('./routes/documents');
  documentRoutes = documentModule.default || documentModule;
} catch (e) {
  console.warn('Document routes not available:', e.message);
}

const app = express();

// Security & Performance Middlewares
app.use(helmet()); // Bảo vệ app khỏi các lỗ hổng web phổ biến
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression()); // Nén response để tăng tốc
app.use(morgan('dev')); // Log HTTP requests
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

// API Documentation - Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint - Kiểm tra server còn sống
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes - Tất cả routes đều có prefix /api
if (authRoutes) app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/users', userRoutes);
if (sessionRoutes) app.use('/api/sessions', sessionRoutes);
if (classRoutes) app.use('/api/classes', classRoutes);

// Module VI Routes - Teaching & Learning Support
if (scheduleRoutes) app.use('/api/schedules', scheduleRoutes);
if (attendanceRoutes) app.use('/api/attendance', attendanceRoutes);
if (evaluationRoutes) app.use('/api/evaluations', evaluationRoutes);
if (documentRoutes) app.use('/api/documents', documentRoutes);

// 404 Handler - Route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler - Phải đặt cuối cùng
app.use(errorHandler);

module.exports = app;
