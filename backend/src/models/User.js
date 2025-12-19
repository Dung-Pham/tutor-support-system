import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
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
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
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
    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      required: true, // Make role required for registration
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true, // Index để tối ưu query khi lọc users online
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Virtual field để tính trạng thái online (user online nếu lastSeenAt trong vòng 5 phút)
userSchema.virtual("isOnline").get(function () {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  return this.lastSeenAt >= fiveMinutesAgo;
});

// Đảm bảo virtuals được serialize khi convert sang JSON/Object
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema);

export default User;
