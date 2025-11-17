/**
 * File: classController.js
 * Mục đích: Controller functions cho Class APIs
 * Vai trò:
 *   - Handle business logic cho class management
 *   - Tương tác với database thông qua queries
 *   - Format response data
 * Lưu ý:
 *   - Sử dụng responseFormatter cho consistent response format
 *   - Validate input data trước khi process
 *   - Handle errors appropriately
 */

const responseFormatter = require('../utils/responseFormatter');
const { getMyClassesQuery } = require('../models/queries/classQueries');

/**
 * Get classes for current user
 * - If user is TUTOR: return classes they're teaching
 * - If user is USER (student): return classes they're enrolled in
 */
const getMyClasses = async (req, res) => {
  try {
    // Get user from req.user (set by auth middleware)
    const userId = req.user?.userId || req.user?.user_id;
    const userRole = req.user?.role;

    console.log(`Getting classes for user ${userId} with role ${userRole}`);

    const classes = await getMyClassesQuery(userId, userRole);

    console.log(`Found ${classes.length} classes for user ${userId}`);

    res.json({
      success: true,
      data: classes,
      message: 'Lấy danh sách lớp học thành công'
    });
  } catch (error) {
    console.error('Error in getMyClasses:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách lớp học'
    });
  }
};

module.exports = {
  getMyClasses,
};