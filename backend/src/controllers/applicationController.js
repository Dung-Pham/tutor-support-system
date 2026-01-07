/**
 * File: applicationController.js
 * Mục đích: Controller xử lý logic nghiệp vụ cho Applications
 * Vai trò:
 *   - CRUD operations cho Application model (MongoDB)
 *   - Quản lý đơn ứng tuyển của gia sư vào lớp học
 *   - Phụ huynh có thể xem, chấp nhận, hoặc từ chối các đơn ứng tuyển
 * Lưu ý:
 *   - Chỉ gia sư mới có thể tạo application
 *   - Một gia sư chỉ có thể ứng tuyển một lần vào một lớp (unique index)
 *   - Khi accept một application, cần cập nhật Class.selectedTutorId
 */

const Application = require('../models/Application');
const Class = require('../models/Class');

/**
 * @desc    Get all applications (with optional filters)
 * @route   GET /api/applications
 * @access  Public
 */
const getApplications = async (req, res) => {
  try {
    const { status, classId, tutorId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (classId) filter.classId = classId;
    if (tutorId) filter.tutorId = tutorId;

    const applications = await Application.find(filter)
      .populate('classId', 'subject description schedule budget parentId')
      .populate('tutorId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single application by ID
 * @route   GET /api/applications/:id
 * @access  Public
 */
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('classId', 'subject description schedule budget parentId')
      .populate('tutorId', 'name email avatar');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new application
 * @route   POST /api/applications
 * @access  Public (should be restricted to tutors only)
 */
const createApplication = async (req, res) => {
  try {
    const { classId } = req.body;

    // Kiểm tra xem lớp có tồn tại và đang mở không
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    if (classItem.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This class is not accepting applications',
      });
    }

    // Tạo application
    const application = await Application.create(req.body);

    const populatedApplication = await Application.findById(application._id)
      .populate('classId', 'subject description schedule budget')
      .populate('tutorId', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedApplication,
    });
  } catch (error) {
    // Xử lý lỗi duplicate key (gia sư đã ứng tuyển vào lớp này rồi)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this class',
      });
    }

    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message,
    });
  }
};

/**
 * @desc    Update application
 * @route   PUT /api/applications/:id
 * @access  Public
 */
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Nếu application đang được accept, cập nhật selectedTutorId trong Class
    if (req.body.status === 'accepted' && application.status !== 'accepted') {
      await Class.findByIdAndUpdate(
        application.classId,
        { 
          selectedTutorId: application.tutorId,
          status: 'in-progress'
        }
      );

      // Reject tất cả các application khác đang pending
      await Application.updateMany(
        { 
          classId: application.classId,
          _id: { $ne: application._id },
          status: 'pending'
        },
        { status: 'rejected' }
      );
    }

    Object.assign(application, req.body);
    await application.save();

    const updatedApplication = await Application.findById(application._id)
      .populate('classId', 'subject description schedule budget')
      .populate('tutorId', 'name email avatar');

    res.status(200).json({
      success: true,
      data: updatedApplication,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete/withdraw application
 * @route   DELETE /api/applications/:id
 * @access  Public (should be restricted to application owner)
 */
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Chỉ cho phép xóa nếu application đang ở trạng thái pending
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete application that is not pending',
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
};
