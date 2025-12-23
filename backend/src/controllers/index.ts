/**
 * File: controllers/index.ts
 * Mục đích: Export tất cả controllers
 */

export * from "./authController.js";
export * from "./userController.js";
export * from "./postController.js";
export * from "./commentController.js";
export * from "./likeController.js";
export * from "./conversationController.js";
export * from "./messageController.js";
// Note: adminController có một số exports trùng tên với postController
// Import riêng khi cần dùng
export {
  getStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPosts as getAdminPosts,
  getPostById as getAdminPostById,
  deletePost as deleteAdminPost,
} from "./adminController.js";
export * from "./uploadController.js";
