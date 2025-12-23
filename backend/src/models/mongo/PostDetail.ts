/**
 * File: models/mongo/PostDetail.ts
 * Mục đích: MongoDB model cho Post content (JSON phức tạp)
 * Liên kết với PostHeader trong SQL Server qua postHeaderId (UUID)
 */

import mongoose, { Schema, Document, Model } from "mongoose";

// ContentNode interface cho TipTap/ProseMirror JSON
export interface ContentNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: ContentNode[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  text?: string;
}

export interface IPostDetail extends Document {
  postHeaderId: string; // UUID từ SQL Server PostHeaders.id
  contentJson: ContentNode;
  contentPlain: string;
  createdAt: Date;
  updatedAt: Date;
}

const postDetailSchema = new Schema<IPostDetail>(
  {
    postHeaderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    contentJson: {
      type: Schema.Types.Mixed,
      required: true,
      default: {
        type: "doc",
        content: [],
      },
    },
    contentPlain: {
      type: String,
      required: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "post_details",
  }
);

// Index cho full-text search
postDetailSchema.index({ contentPlain: "text" });

const PostDetail: Model<IPostDetail> = mongoose.model<IPostDetail>(
  "PostDetail",
  postDetailSchema
);

export default PostDetail;
