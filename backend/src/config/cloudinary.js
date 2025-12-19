import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables TRƯỚC KHI config
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log để verify (chỉ trong dev)
if (process.env.NODE_ENV !== "production") {
  console.log("🔐 Cloudinary config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing",
  });
}

export default cloudinary;
