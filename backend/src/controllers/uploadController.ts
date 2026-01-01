// Upload Controller - Cloudinary

import { Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
  fieldname: string;
  encoding: string;
}

interface UploadRequest extends Omit<Request, "files"> {
  files?: MulterFile[];
}

interface VideoUploadRequest extends Omit<Request, "file"> {
  file?: MulterFile;
}

interface UploadConfig {
  folder: string;
  resource_type: string;
  transformation: Array<Record<string, unknown>>;
  eager?: Array<Record<string, unknown>>;
  eager_async?: boolean;
}

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  result?: string;
}

// Upload multiple images to Cloudinary
export const uploadImages = async (
  req: UploadRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided",
      });
    }

    const files = req.files.slice(0, 10);

    const type = req.query.type || req.body.type || "chat";
    const validTypes = ["chat", "post", "avatar"];
    const folderType = validTypes.includes(type) ? type : "chat";

    const uploadConfigs: Record<string, UploadConfig> = {
      chat: {
        folder: `tutor-support/${folderType}`,
        resource_type: "image",
        transformation: [{ quality: "auto:eco" }, { fetch_format: "auto" }],
        eager: [
          { width: 1920, height: 1080, crop: "limit", quality: "auto:good" },
        ],
        eager_async: true,
      },
      post: {
        folder: `tutor-support/${folderType}`,
        resource_type: "image",
        transformation: [{ quality: "auto:eco" }, { fetch_format: "auto" }],
        eager: [
          { width: 2048, height: 2048, crop: "limit", quality: "auto:best" },
        ],
        eager_async: true,
      },
      avatar: {
        folder: `tutor-support/${folderType}`,
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
    };

    const config = uploadConfigs[folderType];

    console.log(
      `📤 Uploading ${files.length} images to ${folderType} folder...`
    );

    const uploadPromises = files.map(async (file) => {
      return new Promise<{
        url: string;
        publicId: string;
        width: number;
        height: number;
        format: string;
        bytes: number;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          config as unknown as Parameters<
            typeof cloudinary.uploader.upload_stream
          >[0],
          (error, result) => {
            if (error) {
              console.error("❌ Upload failed", error);
              reject(error);
            } else if (result) {
              console.log(`✅ Uploaded: ${result.secure_url}`);
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

        const bufferStream = Readable.from(file.buffer);
        bufferStream.pipe(uploadStream);
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} images`,
      data: uploadedImages,
    });
  } catch (error) {
    console.error("Upload error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload images",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Generate signature for direct upload to Cloudinary
export const generateSignature = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const type = (req.body?.type || req.query?.type || "chat") as string;
    const validTypes = ["chat", "post", "avatar"];
    const folderType = validTypes.includes(type) ? type : "chat";

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `tutor-support/${folderType}`;

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    console.log(`🔐 Generated signature for ${folderType} upload`);

    return res.status(200).json({
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
    console.error("Signature generation error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate signature",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete image from Cloudinary
export const deleteImage = async (
  req: Request<{ publicId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    console.log(`🗑️ Deleting image: ${publicId}`);

    const result = (await cloudinary.uploader.destroy(
      publicId
    )) as CloudinaryResult;

    if (result.result === "ok") {
      return res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Image not found or already deleted",
      });
    }
  } catch (error) {
    console.error("Delete error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Upload video to Cloudinary
export const uploadVideo = async (
  req: VideoUploadRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video provided",
      });
    }

    const file = req.file;
    const type = req.query.type || req.body.type || "chat";
    const validTypes = ["chat", "post"];
    const folderType = validTypes.includes(type as string) ? type : "chat";

    console.log(`📤 Uploading video to ${folderType} folder...`);

    const uploadResult = await new Promise<{
      url: string;
      publicId: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
      duration: number;
      thumbnail: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `tutor-support/${folderType}/video`,
          resource_type: "video",
          eager: [
            { streaming_profile: "full_hd", format: "m3u8" },
            { format: "mp4", quality: "auto" },
          ],
          eager_async: true,
        },
        (error, result) => {
          if (error) {
            console.error("❌ Video upload failed", error);
            reject(error);
          } else if (result) {
            console.log(`✅ Video uploaded: ${result.secure_url}`);
            // Generate thumbnail URL
            const thumbnailUrl = result.secure_url.replace(
              /\.(mp4|mov|avi|webm|mkv)$/i,
              ".jpg"
            );
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              duration: result.duration || 0,
              thumbnail: thumbnailUrl,
            });
          }
        }
      );

      const bufferStream = Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    });

    return res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      data: uploadResult,
    });
  } catch (error) {
    console.error("Video upload error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload video",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete video from Cloudinary
export const deleteVideo = async (
  req: Request<{ publicId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    console.log(`🗑️ Deleting video: ${publicId}`);

    const result = (await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    })) as CloudinaryResult;

    if (result.result === "ok") {
      return res.status(200).json({
        success: true,
        message: "Video deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Video not found or already deleted",
      });
    }
  } catch (error) {
    console.error("Delete video error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete video",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Upload files/documents to Cloudinary
export const uploadFile = async (
  req: UploadRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files provided",
      });
    }

    const files = req.files.slice(0, 5);
    const type = req.query.type || req.body.type || "chat";
    const validTypes = ["chat", "post"];
    const folderType = validTypes.includes(type as string) ? type : "chat";

    console.log(
      `📤 Uploading ${files.length} files to ${folderType} folder...`
    );

    const uploadPromises = files.map(async (file) => {
      // Decode filename properly (fix Vietnamese characters encoding)
      let fileName = file.originalname;
      try {
        // Try to decode from latin1 to utf8 (fixes multer encoding issue)
        fileName = Buffer.from(file.originalname, "latin1").toString("utf8");
      } catch {
        // Keep original if decode fails
        fileName = file.originalname;
      }

      // Generate a safe public_id (ASCII only, no special chars)
      const safePublicId = `file_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      return new Promise<{
        url: string;
        publicId: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `tutor-support/${folderType}/files`,
            resource_type: "raw",
            public_id: safePublicId,
            use_filename: false,
            unique_filename: true,
          },
          (error, result) => {
            if (error) {
              console.error("❌ File upload failed", error);
              reject(error);
            } else if (result) {
              console.log(`✅ File uploaded: ${result.secure_url}`);
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                fileName: fileName, // Return properly decoded filename
                fileSize: file.size,
                mimeType: file.mimetype,
              });
            }
          }
        );

        const bufferStream = Readable.from(file.buffer);
        bufferStream.pipe(uploadStream);
      });
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} files`,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error("File upload error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload files",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete file from Cloudinary
export const deleteFile = async (
  req: Request<{ publicId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    console.log(`🗑️ Deleting file: ${publicId}`);

    const result = (await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    })) as CloudinaryResult;

    if (result.result === "ok") {
      return res.status(200).json({
        success: true,
        message: "File deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "File not found or already deleted",
      });
    }
  } catch (error) {
    console.error("Delete file error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
