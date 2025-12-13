/**
 * File: src/models/Tag.js
 * Mục đích: MongoDB model cho Tags (nhãn/từ khóa bài viết)
 */

import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    // Tên tag
    tag_name: {
      type: String,
      required: [true, "Tên tag không được để trống"],
      trim: true,
      unique: true,
      lowercase: true,
      maxlength: [50, "Tên tag không vượt quá 50 ký tự"],
      index: true,
    },

    // Slug cho SEO (tạo từ tag_name)
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },

    // Mô tả tag
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Mô tả không vượt quá 500 ký tự"],
    },

    // Số lượng bài viết sử dụng tag này
    post_count: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Thời gian tạo
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Trạng thái (active hoặc inactive)
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "tags",
  }
);

// Index cho efficient querying
tagSchema.index({ tag_name: 1 });
tagSchema.index({ slug: 1 });
tagSchema.index({ status: 1 });

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
