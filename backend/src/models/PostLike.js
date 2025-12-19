/**
 * File: src/models/PostLike.js
 * Mục đích: MongoDB model cho Like trên Post
 */

import mongoose from "mongoose";

const postLikeSchema = new mongoose.Schema(
  {
    // Post được like
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Like phải thuộc về một bài viết"],
      index: true,
    },

    // User like
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Like phải có user"],
      index: true,
    },

    // Thời gian like
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: "postlikes",
  }
);

// Compound index: mỗi user chỉ like 1 post một lần
postLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

// Middleware để populate info
postLikeSchema.pre(["findOne", "find"], function () {
  this.populate("userId", "displayName avatarUrl");
});

const PostLike = mongoose.model("PostLike", postLikeSchema);
export default PostLike;
