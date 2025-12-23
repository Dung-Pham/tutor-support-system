/**
 * File: routes/adminRoute.ts
 * Mục đích: Routes cho Admin Panel API
 * Tất cả routes đều yêu cầu admin role
 */

import { Router } from "express";
import {
  getStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPosts,
  getPostById,
  deletePost,
} from "../controllers/adminController.js";
import { approvePost, rejectPost } from "../controllers/postController.js";
import { protectedRoute, adminOnly } from "../middlewares/userMiddleware.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(protectedRoute);
router.use(adminOnly);

// ============ DASHBOARD ============
// GET /api/admin/stats - Dashboard statistics
router.get("/stats", getStats);

// ============ USER MANAGEMENT ============
// GET /api/admin/users - List all users with pagination
router.get("/users", getUsers);

// GET /api/admin/users/:id - Get user details
router.get("/users/:id", getUserById);

// PATCH /api/admin/users/:id - Update user (role, status, etc.)
router.patch("/users/:id", updateUser);

// DELETE /api/admin/users/:id - Deactivate user
router.delete("/users/:id", deleteUser);

// ============ POST MANAGEMENT ============
// GET /api/admin/posts - List all posts with pagination
router.get("/posts", getPosts);

// GET /api/admin/posts/:id - Get post details
router.get("/posts/:id", getPostById);

// PATCH /api/admin/posts/:id/approve - Approve a post
router.patch("/posts/:id/approve", approvePost);

// PATCH /api/admin/posts/:id/reject - Reject a post
router.patch("/posts/:id/reject", rejectPost);

// DELETE /api/admin/posts/:id - Delete a post
router.delete("/posts/:id", deletePost);

export default router;
