/**
 * File: classController.js
 * Mục đích: Controller xử lý logic nghiệp vụ cho Classes
 * Vai trò:
 *   - CRUD operations cho Class model (MongoDB)
 *   - Quản lý các lớp học được tạo bởi phụ huynh
 *   - Gia sư có thể xem và tìm kiếm các lớp học để ứng tuyển
 * Lưu ý:
 *   - Chỉ phụ huynh mới có thể tạo lớp học
 *   - Khi cập nhật selectedTutorId, cần đồng thời cập nhật status của Application tương ứng
 *   - Khi đóng lớp (status = 'closed'), cần reject tất cả các application đang pending
 */

const Class = require('../models/Class');
const Application = require('../models/Application');

/**
 * @desc    Get all classes (with optional filters)
 * @route   GET /api/classes
 * @access  Public
 */
const getClasses = async (req, res) => {
  try {
    const { status, subject, parentId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (parentId) filter.parentId = parentId;

    const classes = await Class.find(filter)
      .populate('parentId', 'name email')
      .populate('selectedTutorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
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
 * @desc    Get single class by ID
 * @route   GET /api/classes/:id
 * @access  Public
 */
const getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('parentId', 'name email')
      .populate('selectedTutorId', 'name email');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    res.status(200).json({
      success: true,
      data: classItem,
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
 * @desc    Create new class
 * @route   POST /api/classes
 * @access  Public (should be restricted to parents only)
 * @todo    Add authentication middleware to verify user is logged in
 * @todo    Add authorization middleware to verify user has 'parent' role
 * @todo    Auto-populate parentId from authenticated user's session
 */
const createClass = async (req, res) => {
  try {
    // TODO: Add role validation
    // if (req.user.role !== 'parent') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Only parents can create classes',
    //   });
    // }

    const classItem = await Class.create(req.body);

    const populatedClass = await Class.findById(classItem._id)
      .populate('parentId', 'name email');

    res.status(201).json({
      success: true,
      data: populatedClass,
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
 * @desc    Update class
 * @route   PUT /api/classes/:id
 * @access  Public (should be restricted to class owner)
 * @todo    Add authentication middleware
 * @todo    Add ownership validation: req.user._id === classItem.parentId
 */
const updateClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    // TODO: Add ownership check
    // if (req.user._id.toString() !== classItem.parentId.toString()) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'You can only update your own classes',
    //   });
    // }

    // Nếu đang cập nhật selectedTutorId, cần cập nhật status của application tương ứng
    if (req.body.selectedTutorId && req.body.selectedTutorId !== classItem.selectedTutorId?.toString()) {
      // Kiểm tra xem application có tồn tại không
      const selectedApplication = await Application.findOne({
        classId: classItem._id,
        tutorId: req.body.selectedTutorId,
        status: 'pending'
      });

      if (!selectedApplication) {
        return res.status(400).json({
          success: false,
          message: 'No pending application found for the selected tutor',
        });
      }

      // Accept the selected tutor's application
      selectedApplication.status = 'accepted';
      await selectedApplication.save();

      // Reject all other pending applications
      await Application.updateMany(
        { 
          classId: classItem._id, 
          tutorId: { $ne: req.body.selectedTutorId },
          status: 'pending'
        },
        { status: 'rejected' }
      );

      // Cập nhật status của class thành 'in-progress'
      req.body.status = 'in-progress';
    }

    // Nếu đóng lớp, reject tất cả các application đang pending
    if (req.body.status === 'closed' && classItem.status !== 'closed') {
      await Application.updateMany(
        { classId: classItem._id, status: 'pending' },
        { status: 'rejected' }
      );
    }

    Object.assign(classItem, req.body);
    await classItem.save();

    const updatedClass = await Class.findById(classItem._id)
      .populate('parentId', 'name email')
      .populate('selectedTutorId', 'name email');

    res.status(200).json({
      success: true,
      data: updatedClass,
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
 * @desc    Delete class
 * @route   DELETE /api/classes/:id
 * @access  Public (should be restricted to class owner)
 */
const deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    // Xóa tất cả các application liên quan
    await Application.deleteMany({ classId: classItem._id });

    await classItem.deleteOne();

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

/**
 * @desc    Get applications for a specific class
 * @route   GET /api/classes/:id/applications
 * @access  Public (should be restricted to class owner)
 */
const getClassApplications = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    const applications = await Application.find({ classId: req.params.id })
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

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassApplications,
};
