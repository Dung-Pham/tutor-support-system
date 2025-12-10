/**
 * File: src/uploadthing.js
 * Mục đích: UploadThing File Router configuration
 * Cách dùng: Định nghĩa upload routes và callbacks cho UploadThing
 */

import { createUploadthing } from "uploadthing/express";

// Create instance của UploadThing
const f = createUploadthing();

/**
 * Define File Routes
 * imageUploader - route for uploading images for blog posts
 */
export const uploadRouter = {
  // Image uploader route for blog posts
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async (data) => {
    // Callback after successful upload
    // console.log("✅ Upload completed:", {
    //   fileName: data.file.name,
    //   fileSize: data.file.size,
    //   fileUrl: data.file.ufsUrl,
    // });

    return {
      url: data.file.ufsUrl,
    };
  }),
};

export default uploadRouter;
