import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  uploadImage,
} from "../controllers/postController.js";
import { protectedRoute } from "../middlewares/userMiddleWare.js";
import multer from "multer";

const router = express.Router();

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes
router.get("/", getPosts);
router.get("/:id", getPostById);

// Protected routes
router.use(protectedRoute);

router.post("/", createPost);
router.post("/upload", upload.single("image"), uploadImage);
router.put("/:id", updatePost);

export default router;
