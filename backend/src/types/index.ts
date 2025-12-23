import { Request } from "express";
import { Document, Types } from "mongoose";

// ==========================================
// USER TYPES
// ==========================================
export type UserRole = "student" | "tutor" | "admin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  avatarId?: string;
  bio?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isOnline?: boolean;
}

export interface IUserResponse {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  lastSeenAt: Date;
  createdAt: Date;
  isOnline?: boolean;
}

// ==========================================
// AUTH TYPES
// ==========================================
export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUserResponse;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: IUserResponse;
  accessToken?: string;
}

// ==========================================
// POST TYPES
// ==========================================
export type PostStatus = "draft" | "pending" | "approved" | "rejected";

export interface ContentNode {
  type: string;
  text?: string;
  content?: ContentNode[];
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
// COMMENT TYPES
// ==========================================
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

// ==========================================
// LIKE TYPES
// ==========================================
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

// ==========================================
// CONVERSATION & MESSAGE TYPES
// ==========================================
export interface IParticipant {
  userId: Types.ObjectId;
}

export interface ILastMessage {
  _id?: string;
  content?: string;
  senderId?: Types.ObjectId;
  createdAt?: Date;
}

export interface IConversation extends Document {
  _id: Types.ObjectId;
  type: "direct" | "group";
  participants: IParticipant[];
  lastMessageAt?: Date;
  seenBy: { user: Types.ObjectId }[];
  lastMessage?: ILastMessage;
  unreadCounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttachment {
  type: "image" | "video" | "file" | "audio";
  url: string;
  publicId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content?: string;
  imgUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// NOTIFICATION TYPES
// ==========================================
export type NotificationType =
  | "post_liked"
  | "post_commented"
  | "comment_replied"
  | "comment_liked"
  | "post_approved"
  | "post_rejected"
  | "new_message"
  | "new_follower"
  | "system";

export interface INotification extends Document {
  _id: string;
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title?: string;
  message?: string;
  postId?: string;
  commentId?: string;
  conversationId?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==========================================
// SOCKET TYPES
// ==========================================
export interface SocketUser {
  odSocketId: string;
  odUserData: IUserResponse;
}

export interface OnlineUsers {
  [odUserId: string]: SocketUser;
}
