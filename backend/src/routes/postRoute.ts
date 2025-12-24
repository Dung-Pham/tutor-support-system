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
  getDeletedPosts,
  approvePost,
  rejectPost,
  restorePost,
  hardDeletePost,
} from "../controllers/postController.js";
import {
  togglePostLike,
  checkPostLike,
  getPostLikes,
} from "../controllers/likeController.js";
import { protectedRoute, adminOnly } from "../middlewares/userMiddleware.js";
import { validateBody } from "../validators/validate.js";
import {
  createPostSchema,
  updatePostSchema,
  rejectPostSchema,
} from "../validators/schemas/postSchema.js";

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (fn: any) => fn;

router.get("/", wrap(getApprovedPosts));
router.get("/my", protectedRoute, wrap(getMyPosts));
router.get("/pending", protectedRoute, adminOnly, wrap(getPendingPosts));
router.get("/rejected", protectedRoute, adminOnly, wrap(getRejectedPosts));
router.get("/deleted", protectedRoute, adminOnly, wrap(getDeletedPosts));
router.get("/:id", wrap(getPostDetail));

router.post(
  "/",
  protectedRoute,
  validateBody(createPostSchema),
  wrap(createPost)
);
router.patch(
  "/:id",
  protectedRoute,
  validateBody(updatePostSchema),
  wrap(updatePost)
);
router.delete("/:id", protectedRoute, wrap(deletePost));
router.delete(
  "/:id/permanent",
  protectedRoute,
  adminOnly,
  wrap(hardDeletePost)
);

router.patch("/:id/approve", protectedRoute, adminOnly, wrap(approvePost));
router.patch(
  "/:id/reject",
  protectedRoute,
  adminOnly,
  validateBody(rejectPostSchema),
  wrap(rejectPost)
);
router.patch("/:id/restore", protectedRoute, adminOnly, wrap(restorePost));

// Like routes
router.post("/:id/like", protectedRoute, wrap(togglePostLike));
router.get("/:id/like", protectedRoute, wrap(checkPostLike));
router.get("/:id/likes", wrap(getPostLikes));

export default router;
