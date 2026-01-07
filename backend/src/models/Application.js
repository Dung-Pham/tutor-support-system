/**
 * File: Application.js
 * Mục đích: Model Application cho MongoDB
 * Vai trò:
 *   - Định nghĩa schema cho đơn ứng tuyển của gia sư vào lớp học
 *   - Phụ huynh sẽ xem xét và chấp nhận/từ chối các đơn ứng tuyển
 * Lưu ý:
 *   - classId reference đến Class model
 *   - tutorId reference đến User với role 'tutor'
 *   - Status: 'pending', 'accepted', 'rejected', 'withdrawn'
 *   - Swagger schema được định nghĩa cho API docs
 */

const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       required:
 *         - classId
 *         - tutorId
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID
 *         classId:
 *           type: string
 *           description: ID của lớp học
 *         tutorId:
 *           type: string
 *           description: ID của gia sư ứng tuyển
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected, withdrawn]
 *           description: Trạng thái đơn ứng tuyển
 *         coverLetter:
 *           type: string
 *           description: Thư giới thiệu của gia sư
 *         proposedRate:
 *           type: number
 *           description: Mức phí đề xuất (VNĐ/giờ)
 *         experience:
 *           type: string
 *           description: Kinh nghiệm liên quan
 *         availability:
 *           type: string
 *           description: Lịch có thể dạy
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const applicationSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tutor ID is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    coverLetter: {
      type: String,
      trim: true,
      default: '',
    },
    proposedRate: {
      type: Number,
      min: 0,
      default: null,
    },
    experience: {
      type: String,
      trim: true,
      default: '',
    },
    availability: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Tạo index compound để đảm bảo một gia sư chỉ ứng tuyển một lần vào một lớp
applicationSchema.index({ classId: 1, tutorId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
