/**
 * File: src/models/ReplyComment.js
 * Mục đích: MongoDB model cho Reply Comment (trả lời comment)
 */

import mongoose from "mongoose";

const replyCommentSchema = new mongoose.Schema(
  {
    // Comment gốc mà reply này trả lời
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewsComment",
      required: [true, "Reply phải thuộc về một comment"],
      index: true,
    },

    // Tác giả reply
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reply phải có tác giả"],
      index: true,
    },

    // Nội dung reply
    reply_comment_content: {
      type: String,
      required: [true, "Nội dung reply không được để trống"],
      trim: true,
      maxlength: [1000, "Reply không vượt quá 1000 ký tự"],
    },

    // Thời gian tạo
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

    // Số lượng likes trên reply
    like_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "reply_comments",
  }
);

// Index cho efficient querying
replyCommentSchema.index({ comment_id: 1, create_at: -1 });
replyCommentSchema.index({ accountId: 1 });

// Middleware để populate author info
replyCommentSchema.pre(["findOne", "find"], function () {
  this.populate("accountId", "displayName avatarUrl");
  this.populate("comment_id", "comment_content");
});

const ReplyComment = mongoose.model("ReplyComment", replyCommentSchema);
export default ReplyComment;
