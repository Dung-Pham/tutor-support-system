/**
 * File: routes/upload.ts
 * Mục đích: Routes xử lý upload file
 */

import { Router, Response } from 'express';
import { uploadHomework, uploadSubmission, uploadDocument } from '../middlewares/upload';
import { authenticate } from '../middlewares/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Apply authentication
router.use(authenticate);

/**
 * Upload homework attachment
 * POST /api/upload/homework
 */
router.post('/homework', uploadHomework.single('attachment'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/homework/${req.file.filename}`;
    
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
});

/**
 * Upload submission attachment
 * POST /api/upload/submission
 */
router.post('/submission', uploadSubmission.single('attachment'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/submissions/${req.file.filename}`;
    
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
});

/**
 * Upload document attachment
 * POST /api/upload/document
 */
router.post('/document', uploadDocument.single('attachment'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
});

export default router;
