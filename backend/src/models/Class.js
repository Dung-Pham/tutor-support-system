/**
 * File: Class.js
 * Mục đích: Model Class cho MongoDB
 * Vai trò:
 *   - Định nghĩa schema cho lớp học được tạo bởi phụ huynh
 *   - Gia sư sẽ tìm kiếm và ứng tuyển vào các lớp này
 * Lưu ý:
 *   - parentId reference đến User với role 'parent'
 *   - Status: 'open', 'in-progress', 'closed'
 *   - Swagger schema được định nghĩa cho API docs
 */

const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       required:
 *         - parentId
 *         - subject
 *         - description
 *         - schedule
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID
 *         parentId:
 *           type: string
 *           description: ID của phụ huynh tạo lớp
 *         subject:
 *           type: string
 *           description: Môn học
 *         description:
 *           type: string
 *           description: Mô tả chi tiết về lớp học
 *         requirements:
 *           type: string
 *           description: Yêu cầu đối với gia sư
 *         schedule:
 *           type: string
 *           description: Lịch học dự kiến
 *         status:
 *           type: string
 *           enum: [open, in-progress, closed]
 *           description: Trạng thái lớp học
 *         budget:
 *           type: number
 *           description: Ngân sách (VNĐ/giờ)
 *         location:
 *           type: string
 *           description: Địa điểm học
 *         studentLevel:
 *           type: string
 *           description: Trình độ học sinh
 *         sessionsPerWeek:
 *           type: number
 *           description: Số buổi học mỗi tuần
 *         selectedTutorId:
 *           type: string
 *           description: ID của gia sư được chọn (nếu có)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const classSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Parent ID is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    requirements: {
      type: String,
      trim: true,
      default: '',
    },
    schedule: {
      type: String,
      required: [true, 'Schedule is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'closed'],
      default: 'open',
    },
    budget: {
      type: Number,
      min: 0,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    studentLevel: {
      type: String,
      trim: true,
      default: '',
    },
    sessionsPerWeek: {
      type: Number,
      min: 1,
      default: 1,
    },
    selectedTutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Class', classSchema);
