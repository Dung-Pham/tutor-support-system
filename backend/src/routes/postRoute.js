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
import {
  togglePostLike,
  checkPostLike,
  getPostLikes,
} from "../controllers/likeController.js";
import { protectedRoute } from "../middlewares/userMiddleware.js";
import { sanitizePostContent } from "../middlewares/sanitizeHtml.js";

const router = express.Router();

router.get("/", getApprovedPosts);

router.get("/my", protectedRoute, getMyPosts);
router.get("/pending", protectedRoute, getPendingPosts);
router.get("/rejected", protectedRoute, getRejectedPosts);

router.get("/:id", getPostDetail);

router.post("/", protectedRoute, sanitizePostContent, createPost);
router.patch("/:id", protectedRoute, sanitizePostContent, updatePost);
router.delete("/:id", protectedRoute, deletePost);

router.patch("/:id/approve", protectedRoute, approvePost);
router.patch("/:id/reject", protectedRoute, rejectPost);

// Like routes
router.post("/:id/like", protectedRoute, togglePostLike);
router.get("/:id/like", protectedRoute, checkPostLike);
router.get("/:id/likes", getPostLikes);

export default router;
