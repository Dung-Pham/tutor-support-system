import express from "express";
import {
  registerStudent,
  registerTutor,
  signIn,
  signOut,
  refreshToken,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register/student", registerStudent);
router.post("/register/tutor", registerTutor);
router.post("/signin", signIn);

router.post("/signout", signOut);

router.post("/refresh", refreshToken);

export default router;
