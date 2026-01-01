// Auth routes

import { Router } from "express";
import {
  registerStudent,
  registerTutor,
  signIn,
  signOut,
  refreshToken,
} from "../controllers/authController.js";
import { validateBody } from "../validators/validate.js";
import {
  registerSchema,
  signInSchema,
} from "../validators/schemas/authSchema.js";

const router = Router();

router.post("/register/student", validateBody(registerSchema), registerStudent);
router.post("/register/tutor", validateBody(registerSchema), registerTutor);
router.post("/signin", validateBody(signInSchema), signIn);
router.post("/signout", signOut);
router.post("/refresh", refreshToken);

export default router;
