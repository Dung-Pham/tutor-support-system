/**
 * File: middlewares/upload.ts
 * Mục đích: Middleware xử lý upload file
 */

import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const documentsDir = path.join(uploadsDir, 'documents');
const homeworkDir = path.join(uploadsDir, 'homework');
const submissionsDir = path.join(uploadsDir, 'submissions');
const generalDir = path.join(uploadsDir, 'general');

[uploadsDir, documentsDir, homeworkDir, submissionsDir, generalDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for different upload types
const createStorage = (subFolder: string) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsDir, subFolder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueId = randomUUID();
    const ext = path.extname(file.originalname);
    // Decode filename from latin1 to utf8 to fix Vietnamese characters
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    // Only replace characters that are invalid for filenames (keep Unicode letters)
    const safeName = originalName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
    cb(null, `${uniqueId}-${safeName}`);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

// Upload configurations
export const uploadDocument = multer({
  storage: createStorage('documents'),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

export const uploadHomework = multer({
  storage: createStorage('homework'),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

export const uploadSubmission = multer({
  storage: createStorage('submissions'),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// Generic upload for any file
export const uploadGeneric = multer({
  storage: createStorage('general'),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

export default {
  uploadDocument,
  uploadHomework,
  uploadSubmission,
  uploadGeneric,
};
