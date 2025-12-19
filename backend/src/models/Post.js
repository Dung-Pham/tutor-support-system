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
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Tiptap editor content (JSON document - ProseMirror format)
    contentJson: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Vui lòng nhập nội dung bài viết"],
    },

    // Plain text version of content (auto-derived for search/preview)
    contentPlain: {
      type: String,
      default: "",
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

    // Admin rejection info
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedAt: {
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

// Helper method to extract plain text from Tiptap JSON document
postSchema.methods.extractPlainText = function () {
  if (!this.contentJson || typeof this.contentJson !== "object") {
    return "";
  }

  const extractTextFromNode = (node) => {
    let text = "";

    if (node.type === "text" && node.text) {
      text += node.text;
    }

    if (node.content && Array.isArray(node.content)) {
      node.content.forEach((child) => {
        text += extractTextFromNode(child);
      });
    }

    // Add spacing after block nodes
    if (["paragraph", "heading", "listItem"].includes(node.type)) {
      text += " ";
    }

    return text;
  };

  return extractTextFromNode(this.contentJson).trim();
};

// Auto-generate contentPlain from contentJson before save
postSchema.pre("save", function (next) {
  if (this.contentJson && this.isModified("contentJson")) {
    this.contentPlain = this.extractPlainText();
  }
  next();
});

// Index for efficient querying
postSchema.index({ author: 1, status: 1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ slug: 1 });
// Index for text search on plain content
postSchema.index({ contentPlain: "text", title: "text" });

// Middleware to populate author info
postSchema.pre(["findOne", "find"], function () {
  this.populate("author", "displayName avatarUrl role");
});

postSchema.pre(["findOne", "find"], function () {
  this.populate("approvedBy", "displayName");
});

const Post = mongoose.model("Post", postSchema);
export default Post;
