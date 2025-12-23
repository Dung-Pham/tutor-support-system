/**
 * File: routes/commentRoute.ts
 * Mục đích: Routes cho Comment feature
 */

import { Router } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  createReply,
  getReplies,
  deleteReply,
} from "../controllers/commentController.js";
import {
  toggleCommentLike,
  checkCommentLike,
  toggleReplyLike,
  checkReplyLike,
} from "../controllers/likeController.js";
import { protectedRoute } from "../middlewares/userMiddleware.js";

const router = Router();

// ==================== COMMENT ROUTES ====================

// Lấy danh sách comment của bài viết (public)
router.get("/posts/:postId/comments", getComments);

// Tạo comment (cần đăng nhập)
router.post("/posts/:postId/comments", protectedRoute, createComment);

// Cập nhật comment (cần đăng nhập, chỉ chủ sở hữu)
router.patch("/comments/:commentId", protectedRoute, updateComment);

// Xóa comment (cần đăng nhập, chủ sở hữu hoặc admin)
router.delete("/comments/:commentId", protectedRoute, deleteComment);

// ==================== REPLY ROUTES ====================

// Lấy danh sách reply của comment (public)
router.get("/comments/:commentId/replies", getReplies);

// Tạo reply (cần đăng nhập)
router.post("/comments/:commentId/replies", protectedRoute, createReply);

// Xóa reply (cần đăng nhập, chủ sở hữu hoặc admin)
router.delete("/replies/:replyId", protectedRoute, deleteReply);

// ==================== LIKE ROUTES ====================

// Like/Unlike comment (toggle)
router.post("/comments/:commentId/like", protectedRoute, toggleCommentLike);

// Kiểm tra đã like comment chưa
router.get("/comments/:commentId/like", protectedRoute, checkCommentLike);

// Like/Unlike reply (toggle)
router.post("/replies/:replyId/like", protectedRoute, toggleReplyLike);

// Kiểm tra đã like reply chưa
router.get("/replies/:replyId/like", protectedRoute, checkReplyLike);

export default router;
