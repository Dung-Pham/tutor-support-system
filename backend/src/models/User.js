import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String, // Link CDN lưu ảnh đại diện
    },
    avatarId: {
      type: String, // Cloudinary public_id để quản lý ảnh
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    phone: {
      type: String,
      sparse: true, // Cho phép null nhưng nếu có thì phải unique
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const User = mongoose.model("User", userSchema);

export default User;
