/**
 * File: src/models/ReplyCommentLike.js
 * Mục đích: MongoDB model cho Like trên Reply Comment
 */

import mongoose from "mongoose";

const replyCommentLikeSchema = new mongoose.Schema(
  {
    // Reply được like
    reply_like_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReplyComment",
      required: [true, "Like phải thuộc về một reply"],
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
    collection: "replycommentlikes",
  }
);

// Compound index: mỗi user chỉ like 1 reply một lần
replyCommentLikeSchema.index(
  { reply_like_id: 1, account_id: 1 },
  { unique: true }
);

// Middleware để populate info
replyCommentLikeSchema.pre(["findOne", "find"], function () {
  this.populate("account_id", "displayName avatarUrl");
  this.populate("reply_like_id", "reply_comment_content");
});

const ReplyCommentLike = mongoose.model(
  "ReplyCommentLike",
  replyCommentLikeSchema
);
export default ReplyCommentLike;
