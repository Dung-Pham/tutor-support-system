// Post routes

import { Router } from "express";
import {
  getApprovedPosts,
  getPostDetail,
  createPost,
  updatePost,
  softDeletePost,
  getMyPosts,
  getPostsByStatus,
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
// Unified route for admin to get posts by status (pending, rejected, deleted)
router.get(
  "/status/:status",
  protectedRoute,
  adminOnly,
  wrap(getPostsByStatus)
);
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
// Soft delete (admin only) - chuyển vào thùng rác
router.delete("/:id", protectedRoute, adminOnly, wrap(softDeletePost));
// Hard delete - tutor xóa bài draft/pending, admin xóa tất cả
router.delete("/:id/permanent", protectedRoute, wrap(hardDeletePost));

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
