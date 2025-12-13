/**
 * File: src/models/CommentLike.js
 * Mục đích: MongoDB model cho Like trên Comment
 */

import mongoose from "mongoose";

const commentLikeSchema = new mongoose.Schema(
  {
    // Comment được like
    comment_like_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewsComment",
      required: [true, "Like phải thuộc về một comment"],
      index: true,
    },

    // User like
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Like phải có user"],
      index: true,
    },

    // Thời gian like
    create_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: "commentlikes",
  }
);

// Compound index: mỗi user chỉ like 1 comment một lần
commentLikeSchema.index(
  { comment_like_id: 1, account_id: 1 },
  { unique: true }
);

// Middleware để populate info
commentLikeSchema.pre(["findOne", "find"], function () {
  this.populate("account_id", "displayName avatarUrl");
  this.populate("comment_like_id", "comment_content");
});

const CommentLike = mongoose.model("CommentLike", commentLikeSchema);
export default CommentLike;
