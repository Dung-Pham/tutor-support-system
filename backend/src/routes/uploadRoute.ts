// Upload routes (Cloudinary) - protected by global middleware

import { Router } from "express";
import multer from "multer";
import {
  uploadImages,
  uploadVideo,
  uploadFile,
  deleteImage,
  deleteVideo,
  deleteFile,
  generateSignature,
} from "../controllers/uploadController.js";

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (fn: any) => fn;

// Configure multer for memory storage (no disk writes)
const storage = multer.memoryStorage();

// Image upload config
const imageUpload = multer({
  storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB per file
    files: 10, // Max 10 files
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Video upload config
const videoUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per video
    files: 1, // Max 1 video at a time
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

// File/Document upload config
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
];

const fileUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file
    files: 5, // Max 5 files at a time
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "File type not allowed. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR, 7Z"
        )
      );
    }
  },
});

router.post("/signature", wrap(generateSignature));

router.post("/images", imageUpload.array("images", 10), wrap(uploadImages));

router.post("/video", videoUpload.single("video"), wrap(uploadVideo));

router.post("/files", fileUpload.array("files", 5), wrap(uploadFile));

router.delete("/images/:publicId", wrap(deleteImage));

router.delete("/video/:publicId", wrap(deleteVideo));

router.delete("/files/:publicId", wrap(deleteFile));

export default router;
