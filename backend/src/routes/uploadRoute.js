import express from "express";
import multer from "multer";
import {
  uploadImages,
  deleteImage,
  generateSignature,
} from "../controllers/uploadController.js";
import { authenticateToken } from "../middlewares/userMiddleware.js";

const router = express.Router();

// Configure multer for memory storage (no disk writes)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB per file
    files: 10, // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Only accept images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/signature", authenticateToken, generateSignature);

router.post(
  "/images",
  authenticateToken,
  upload.array("images", 10),
  uploadImages
);

router.delete("/images/:publicId", authenticateToken, deleteImage);

export default router;
