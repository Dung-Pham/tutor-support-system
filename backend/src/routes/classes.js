/**
 * File: classes.js
 * Mục đích: Định nghĩa routes cho Class APIs
 * Vai trò:
 *   - Map HTTP methods đến controller functions cho class management
 *   - Định nghĩa Swagger documentation cho endpoints
 * Lưu ý:
 *   - Routes này handle prefix /api/classes (defined in app.js)
 *   - Cần authentication middleware cho tất cả routes
 *   - Swagger comments phải tuân thủ chuẩn OpenAPI 3.0
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.js');
// const classController = require('../controllers/classController');

// Simple test route
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'Classes routes working', timestamp: new Date().toISOString() });
});

// router.get('/my-classes', authenticate, classController.getMyClasses);

module.exports = router;