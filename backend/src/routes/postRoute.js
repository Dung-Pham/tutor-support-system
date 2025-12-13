/**
 * File: src/routes/postRoute.js
 * Mục đích: Routes cho Post/Blog feature
 */

import express from "express";
import {
  getApprovedPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  getPendingPosts,
  getRejectedPosts,
  approvePost,
  rejectPost,
} from "../controllers/postController.js";
import { protectedRoute } from "../middlewares/userMiddleware.js";
import { sanitizePostContent } from "../middlewares/sanitizeHtml.js";

const router = express.Router();

// Public routes - không cần authentication
router.get("/", getApprovedPosts);

// Protected routes - cần authentication (phải đặt TRƯỚC /:id)
router.get("/my", protectedRoute, getMyPosts);
router.get("/pending", protectedRoute, getPendingPosts);
router.get("/rejected", protectedRoute, getRejectedPosts);

// Public routes - chi tiết post
router.get("/:id", getPostDetail);

// Post modification routes
router.post("/", protectedRoute, sanitizePostContent, createPost);
router.patch("/:id", protectedRoute, sanitizePostContent, updatePost);
router.delete("/:id", protectedRoute, deletePost);

// Admin routes
router.patch("/:id/approve", protectedRoute, approvePost);
router.patch("/:id/reject", protectedRoute, rejectPost);

export default router;
