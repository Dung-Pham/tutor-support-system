/**
 * File: src/models/Post.js
 * Mục đích: MongoDB model cho Post/Blog feature
 */

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    // Bài viết content
    title: {
      type: String,
      required: [true, "Vui lòng nhập tiêu đề bài viết"],
      trim: true,
      maxlength: [200, "Tiêu đề không vượt quá 200 ký tự"],
    },
    content: {
      type: String,
      required: [true, "Vui lòng nhập nội dung bài viết"],
      // HTML string from TipTap editor
    },

    // Tác giả
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Bài viết phải có tác giả"],
      index: true,
    },

    // Trạng thái: draft (nháp), pending (chờ duyệt), approved (đã duyệt), rejected (từ chối)
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
      index: true,
    },

    // URLs of images extracted from HTML (for cleanup purposes)
    imageUrls: {
      type: [String],
      default: [],
    },

    // Rejection reason (nếu status === 'rejected')
    rejectionReason: {
      type: String,
      maxlength: [500, "Lý do từ chối không vượt quá 500 ký tự"],
    },

    // Admin approval info
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },

    // Metadata
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: "posts",
  }
);

// Index for efficient querying
postSchema.index({ author: 1, status: 1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

// Middleware to populate author info
postSchema.pre(["findOne", "find"], function () {
  this.populate("author", "displayName avatarUrl role");
});

postSchema.pre(["findOne", "find"], function () {
  this.populate("approvedBy", "displayName");
});

const Post = mongoose.model("Post", postSchema);
export default Post;
