// Upload routes (Cloudinary) - protected by global middleware

import { Router } from "express";
import multer from "multer";
import {
  uploadImages,
  deleteImage,
  generateSignature,
} from "../controllers/uploadController.js";

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

router.post("/signature", wrap(generateSignature));

router.post("/images", upload.array("images", 10), wrap(uploadImages));

router.delete("/images/:publicId", wrap(deleteImage));

export default router;
