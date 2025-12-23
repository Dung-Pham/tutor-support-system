/**
 * File: routes/authRoute.ts
 * Mục đích: Auth routes
 */

import { Router } from "express";
import {
  registerStudent,
  registerTutor,
  signIn,
  signOut,
  refreshToken,
} from "../controllers/authController.js";

const router = Router();

router.post("/register/student", registerStudent);
router.post("/register/tutor", registerTutor);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.post("/refresh", refreshToken);

export default router;
