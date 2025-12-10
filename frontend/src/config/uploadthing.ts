/**
 * File: src/config/uploadthing.ts
 * Mục đích: Cấu hình UploadThing cho Frontend
 */

import { generateReactHelpers } from '@uploadthing/react';

/**
 * UploadThing API configuration
 * - URL trỏ tới UploadThing endpoint trên backend
 * - Routes defined in backend uploadthing.js: imageUploader
 * - Max file size: 4MB
 * - Allowed types: images (jpg, png, gif, webp, etc.)
 */
export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: `${import.meta.env.VITE_API_URL}/api/uploadthing`,
});
