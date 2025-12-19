/**
 * File: controllers/uploadController.js
 * Mục đích: Handle image uploads với Cloudinary
 */

import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

/**
 * Upload multiple images to Cloudinary
 * POST /api/upload/images
 * Body: multipart/form-data với field "images"
 */
export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided",
      });
    }

    // Maximum 10 images
    const files = req.files.slice(0, 10);

    // Get folder type: 'chat' | 'post' | 'avatar' (default: chat)
    const type = req.query.type || req.body.type || "chat";
    const validTypes = ["chat", "post", "avatar"];
    const folderType = validTypes.includes(type) ? type : "chat";

    // Define configurations for each type
    const uploadConfigs = {
      chat: {
        folder: `tutor-support/${folderType}`,
        resource_type: "image",
        // Basic transformation only (fast)
        transformation: [
          { quality: "auto:eco" }, // Faster than "auto:good"
          { fetch_format: "auto" },
        ],
        // Heavy transformations run in background
        eager: [
          { width: 1920, height: 1080, crop: "limit", quality: "auto:good" },
        ],
        eager_async: true, // ⚡ Transform in background, don't wait
      },
      post: {
        folder: `tutor-support/${folderType}`,
        resource_type: "image",
        transformation: [
          { quality: "auto:eco" }, // Upload nhanh trước
          { fetch_format: "auto" },
        ],
        eager: [
          { width: 2048, height: 2048, crop: "limit", quality: "auto:best" },
        ],
        eager_async: true, // ⚡ High quality transform sau
      },
      avatar: {
        folder: `tutor-support/${folderType}`,
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
        // Avatar nhỏ nên không cần eager
      },
    };

    const config = uploadConfigs[folderType];

    console.log(
      `📤 Uploading ${files.length} images to ${folderType} folder...`
    );

    // Upload all images in parallel
    const uploadPromises = files.map(async (file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          config,
          (error, result) => {
            if (error) {
              console.error("❌ Upload failed:", error);
              reject(error);
            } else {
              console.log("✅ Uploaded:", result.secure_url);
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
              });
            }
          }
        );

        // Convert buffer to stream and pipe to Cloudinary
        const bufferStream = Readable.from(file.buffer);
        bufferStream.pipe(uploadStream);
      });
    });

    // Wait for all uploads to complete
    const uploadedImages = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} images`,
      data: uploadedImages,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload images",
      error: error.message,
    });
  }
};

/**
 * Generate signature for direct upload to Cloudinary
 * POST /api/upload/signature
 * Body: { type: 'chat' | 'post' | 'avatar' }
 */
export const generateSignature = async (req, res) => {
  try {
    const type = req.body.type || req.query.type || "chat";
    const validTypes = ["chat", "post", "avatar"];
    const folderType = validTypes.includes(type) ? type : "chat";

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `tutor-support/${folderType}`;

    // Parameters to sign
    const paramsToSign = {
      timestamp,
      folder,
    };

    // Generate signature using Cloudinary SDK
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    console.log(`🔐 Generated signature for ${folderType} upload`);

    res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
      },
    });
  } catch (error) {
    console.error("Signature generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate signature",
      error: error.message,
    });
  }
};

/**
 * Delete image from Cloudinary
 * DELETE /api/upload/images/:publicId
 */
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    console.log(`🗑️ Deleting image: ${publicId}`);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Image not found or already deleted",
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};
