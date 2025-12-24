/**
 * File: types/post.ts
 * Mục đích: Post-related types
 */

import { Document, Types } from "mongoose";
import { IUser } from "./user.js";

// ==========================================
// POST TYPES
// ==========================================
export type PostStatus = "draft" | "pending" | "approved" | "rejected";

export interface ContentNode {
  type: string;
  text?: string;
  content?: ContentNode[];
  [key: string]: unknown;
}

export interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  contentJson: ContentNode;
  contentPlain: string;
  author: Types.ObjectId | IUser;
  status: PostStatus;
  rejectionReason?: string;
  approvedBy?: Types.ObjectId | IUser;
  approvedAt?: Date;
  rejectedBy?: Types.ObjectId | IUser;
  rejectedAt?: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// POST REQUEST TYPES
// ==========================================
export interface CreatePostData {
  title: string;
  contentJson: Record<string, unknown>;
  status?: "draft" | "pending";
}

export interface UpdatePostData {
  title?: string;
  contentJson?: Record<string, unknown>;
  status?: "draft" | "pending";
}
