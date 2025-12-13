/**
 * File: src/models/PostTag.js
 * Mục đích: MongoDB model cho quan hệ Many-to-Many giữa Post và Tag
 */

import mongoose from "mongoose";

const postTagSchema = new mongoose.Schema(
  {
    // Bài viết
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "PostTag phải thuộc về một bài viết"],
      index: true,
    },

    // Tag
    tag_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: [true, "PostTag phải thuộc về một tag"],
      index: true,
    },

    // Thời gian được thêm vào
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: "post_tags",
  }
);

// Compound unique index: một post + tag chỉ có một lần liên kết
postTagSchema.index({ post_id: 1, tag_id: 1 }, { unique: true });

// Index cho query by post hoặc tag
postTagSchema.index({ post_id: 1 });
postTagSchema.index({ tag_id: 1 });

// Middleware để populate info
postTagSchema.pre(["findOne", "find"], function () {
  this.populate("post_id", "title slug");
  this.populate("tag_id", "tag_name slug");
});

const PostTag = mongoose.model("PostTag", postTagSchema);
export default PostTag;
