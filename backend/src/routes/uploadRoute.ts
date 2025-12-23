/**
 * File: routes/uploadRoute.ts
 * Mục đích: Upload routes (Cloudinary)
 */

import { Router } from "express";
import multer from "multer";
import {
  uploadImages,
  deleteImage,
  generateSignature,
} from "../controllers/uploadController.js";
import { authenticateToken } from "../middlewares/userMiddleware.js";

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (fn: any) => fn;

// Configure multer for memory storage (no disk writes)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB per file
    files: 10, // Max 10 files
  },
  fileFilter: (_req, file, cb) => {
    // Only accept images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/signature", authenticateToken, wrap(generateSignature));

router.post(
  "/images",
  authenticateToken,
  upload.array("images", 10),
  wrap(uploadImages)
);

router.delete("/images/:publicId", authenticateToken, wrap(deleteImage));

export default router;
