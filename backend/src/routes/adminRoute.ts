// Admin Panel API Routes - Requires admin role

import { Router } from "express";
import {
  getStats,
  getChartData,
  getTopPosts,
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

// Middleware
router.use(protectedRoute);
router.use(adminOnly);

// Dashboard
router.get("/stats", getStats);
router.get("/chart", getChartData);
router.get("/top-posts", getTopPosts);

// Users
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Posts
router.get("/posts", getPosts);
router.get("/posts/:id", getPostById);
router.patch("/posts/:id/approve", approvePost);
router.patch("/posts/:id/reject", rejectPost);
router.delete("/posts/:id", deletePost);

export default router;
