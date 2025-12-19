/**
 * File: src/models/NewsComment.js
 * Mục đích: MongoDB model cho Comment trên bài viết (Post/News)
 */

import mongoose from "mongoose";

const newsCommentSchema = new mongoose.Schema(
  {
    // Bài viết mà comment này thuộc về
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Comment phải thuộc về một bài viết"],
      index: true,
    },

    // Tác giả comment
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment phải có tác giả"],
      index: true,
    },

    // Nội dung comment
    comment_content: {
      type: String,
      required: [true, "Nội dung comment không được để trống"],
      trim: true,
      maxlength: [1000, "Comment không vượt quá 1000 ký tự"],
    },

    // Thời gian tạo (tự động từ timestamps)
    create_at: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Trạng thái (active hoặc deleted)
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
    },

    // Số lượng replies (reply comments)
    reply_count: {
      type: Number,
      default: 0,
    },

    // Số lượng likes
    like_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "newscomments",
  }
);

// Index cho efficient querying (postId và accountId đã có index: true trong schema)
newsCommentSchema.index({ postId: 1, create_at: -1 });
newsCommentSchema.index({ postId: 1, status: 1, create_at: -1 }); // Compound index cho query phổ biến

// Middleware để populate author info (chỉ populate accountId, không populate postId vì không cần)
newsCommentSchema.pre(["findOne", "find"], function () {
  this.populate("accountId", "displayName avatarUrl");
});

const NewsComment = mongoose.model("NewsComment", newsCommentSchema);
export default NewsComment;
