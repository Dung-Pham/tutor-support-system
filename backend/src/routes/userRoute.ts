// User routes (protected by global middleware in app.ts)

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

router.get("/me", authMe);
router.get("/tutors", wrap(getTutors));

// Admin only
router.get("/", adminOnly, wrap(getAllUsers));
router.patch("/:id", adminOnly, wrap(updateUserStatus));

export default router;
