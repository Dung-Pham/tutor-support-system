/**
 * File: routes/userRoute.ts
 * Mục đích: User routes
 * Note: Đã được bảo vệ bởi global protectedRoute trong app.ts
 */

import { Router } from "express";
import {
  authMe,
  getAllUsers,
  updateUserStatus,
  getTutors,
} from "../controllers/userController.js";
import { adminOnly } from "../middlewares/userMiddleware.js";

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (fn: any) => fn;

// Lấy thông tin user hiện tại
router.get("/me", authMe);

// Lấy danh sách tutors (cho students tìm gia sư)
router.get("/tutors", wrap(getTutors));

// Admin only routes
router.get("/", adminOnly, wrap(getAllUsers));
router.patch("/:id", adminOnly, wrap(updateUserStatus));

export default router;
