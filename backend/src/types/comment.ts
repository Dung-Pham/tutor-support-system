// Comment Types

import { Document, Types } from "mongoose";
import { IUser } from "./user.js";
import { IPost } from "./post.js";

export interface IPostComment extends Document {
  _id: Types.ObjectId;
  postId: Types.ObjectId | IPost;
  accountId: Types.ObjectId | IUser;
  comment_content: string;
  create_at: Date;
  status: "active" | "deleted";
  reply_count: number;
  like_count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReplyComment extends Document {
  _id: Types.ObjectId;
  comment_id: Types.ObjectId | IPostComment;
  accountId: Types.ObjectId | IUser;
  reply_comment_content: string;
  create_at: Date;
  status: "active" | "deleted";
  like_count: number;
  createdAt: Date;
}

export interface IPostLike extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

export interface ICommentLike extends Document {
  comment_like_id: Types.ObjectId;
  account_id: Types.ObjectId;
  create_at: Date;
}

export interface IReplyCommentLike extends Document {
  reply_like_id: Types.ObjectId;
  account_id: Types.ObjectId;
  create_at: Date;
}
