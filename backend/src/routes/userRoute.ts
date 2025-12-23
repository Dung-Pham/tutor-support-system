/**
 * File: routes/userRoute.ts
 * Mục đích: User routes
 */

import { Router } from "express";
import {
  authMe,
  getAllUsers,
  updateUserStatus,
} from "../controllers/userController.js";
import { protectedRoute } from "../middlewares/userMiddleware.js";

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (fn: any) => fn;

router.get("/me", wrap(authMe));
router.get("/", protectedRoute, wrap(getAllUsers));
router.patch("/:id", protectedRoute, wrap(updateUserStatus));

export default router;
