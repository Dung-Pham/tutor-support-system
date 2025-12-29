// Comment routes

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

// Comments
router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", protectedRoute, createComment);
router.patch("/comments/:commentId", protectedRoute, updateComment);
router.delete("/comments/:commentId", protectedRoute, deleteComment);

// Replies
router.get("/comments/:commentId/replies", getReplies);
router.post("/comments/:commentId/replies", protectedRoute, createReply);
router.delete("/replies/:replyId", protectedRoute, deleteReply);

// Likes

// Like/Unlike comment (toggle)
router.post("/comments/:commentId/like", protectedRoute, toggleCommentLike);

// Kiểm tra đã like comment chưa
router.get("/comments/:commentId/like", protectedRoute, checkCommentLike);

// Like/Unlike reply (toggle)
router.post("/replies/:replyId/like", protectedRoute, toggleReplyLike);

// Kiểm tra đã like reply chưa
router.get("/replies/:replyId/like", protectedRoute, checkReplyLike);

export default router;
