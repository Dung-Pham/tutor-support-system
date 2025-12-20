/**
 * File: utils/fileHelper.ts
 * Purpose: File validation and formatting utilities
 * Usage: Import functions for file upload validation, size formatting, etc.
 */

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_PDF_SIZE: 15 * 1024 * 1024, // 15 MB
};

/**
 * Allowed file types
 */
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  all: [
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
  ],
};

/**
 * Format file size to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Validate file type
 * @param file - File object
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if file type is valid
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param file - File object
 * @param maxSize - Maximum size in bytes
 * @returns true if file size is valid
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * Get file extension from filename
 * @param filename - File name
 * @returns File extension (e.g., "pdf", "jpg")
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Get file type category (image, document, other)
 * @param mimeType - MIME type
 * @returns 'image' | 'document' | 'other'
 */
export const getFileTypeCategory = (mimeType: string): 'image' | 'document' | 'other' => {
  if (ALLOWED_FILE_TYPES.images.includes(mimeType)) {
    return 'image';
  }
  if (ALLOWED_FILE_TYPES.documents.includes(mimeType)) {
    return 'document';
  }
  return 'other';
};

/**
 * Get file icon name based on file type
 * @param mimeType - MIME type
 * @returns Lucide icon name
 */
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'FileImage';
  if (mimeType === 'application/pdf') return 'FileText';
  if (mimeType.includes('word')) return 'FileText';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'FileSpreadsheet';
  return 'File';
};

/**
 * Validate file before upload
 * @param file - File object
 * @param options - Validation options
 * @returns Validation result { valid: boolean, error?: string }
 */
export const validateFile = (
  file: File,
  options?: {
    allowedTypes?: string[];
    maxSize?: number;
  }
): { valid: boolean; error?: string } => {
  const allowedTypes = options?.allowedTypes || ALLOWED_FILE_TYPES.all;
  const maxSize = options?.maxSize || FILE_SIZE_LIMITS.MAX_FILE_SIZE;

  if (!validateFileType(file, allowedTypes)) {
    return {
      valid: false,
      error: `Loại file không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.map(t => getFileExtension(t)).join(', ')}`,
    };
  }

  if (!validateFileSize(file, maxSize)) {
    return {
      valid: false,
      error: `File quá lớn. Kích thước tối đa: ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
};

/**
 * Create preview URL for image file
 * @param file - File object
 * @returns Promise<string> - Data URL for preview
 */
export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Get file URL (handle both relative and absolute URLs)
 * @param url - File URL
 * @returns Full URL
 */
export const getFileUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Assuming backend serves files from /uploads
  return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
};

/**
 * Check if URL is external link
 * @param url - URL to check
 * @returns true if external link
 */
export const isExternalLink = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Check if file is image
 * @param type - MIME type or file extension
 * @returns true if image
 */
export const isImageFile = (type: string | null | undefined): boolean => {
  if (!type) return false;
  return type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type.toLowerCase());
};

/**
 * Check if file is PDF
 * @param type - MIME type or file extension
 * @returns true if PDF
 */
export const isPdfFile = (type: string | null | undefined): boolean => {
  if (!type) return false;
  return type === 'application/pdf' || type.toLowerCase() === 'pdf';
};

/**
 * Get emoji icon for file type
 * @param type - MIME type or file extension
 * @returns Emoji string
 */
export const getFileEmoji = (type: string | null | undefined): string => {
  if (!type) return '📄';
  
  const lowerType = type.toLowerCase();
  
  if (lowerType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(lowerType)) {
    return '🖼️';
  }
  if (lowerType === 'application/pdf' || lowerType === 'pdf') {
    return '📕';
  }
  if (lowerType.includes('word') || lowerType === 'doc' || lowerType === 'docx') {
    return '📘';
  }
  if (lowerType.includes('excel') || lowerType.includes('spreadsheet') || ['xls', 'xlsx'].includes(lowerType)) {
    return '📊';
  }
  if (lowerType.includes('powerpoint') || lowerType.includes('presentation') || ['ppt', 'pptx'].includes(lowerType)) {
    return '📙';
  }
  if (lowerType === 'application/zip' || lowerType === 'zip') {
    return '📦';
  }
  
  return '📄';
};
