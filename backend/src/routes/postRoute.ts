/**
 * File: routes/postRoute.ts
 * Mục đích: Post routes
 */

import { Router } from "express";
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

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (fn: any) => fn;

router.get("/", wrap(getApprovedPosts));
router.get("/my", protectedRoute, wrap(getMyPosts));
router.get("/pending", protectedRoute, wrap(getPendingPosts));
router.get("/rejected", protectedRoute, wrap(getRejectedPosts));
router.get("/:id", wrap(getPostDetail));

router.post("/", protectedRoute, sanitizePostContent, wrap(createPost));
router.patch("/:id", protectedRoute, sanitizePostContent, wrap(updatePost));
router.delete("/:id", protectedRoute, wrap(deletePost));

router.patch("/:id/approve", protectedRoute, wrap(approvePost));
router.patch("/:id/reject", protectedRoute, wrap(rejectPost));

// Like routes
router.post("/:id/like", protectedRoute, wrap(togglePostLike));
router.get("/:id/like", protectedRoute, wrap(checkPostLike));
router.get("/:id/likes", wrap(getPostLikes));

export default router;
