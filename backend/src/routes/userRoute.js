import express from "express";
import {
  authMe,
  getAllUsers,
  updateUserStatus,
} from "../controllers/userController.js";
import { protectedRoute } from "../middlewares/userMiddleware.js";

const router = express.Router();

router.get("/me", authMe);
router.get("/", protectedRoute, getAllUsers);
router.patch("/:id", protectedRoute, updateUserStatus);

export default router;
