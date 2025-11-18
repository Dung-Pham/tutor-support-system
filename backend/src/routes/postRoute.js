import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import { protectedRoute } from "../middlewares/userMiddleWare.js";

const router = express.Router();

// Tất cả routes cần auth
router.use(protectedRoute);

router.post("/", createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
