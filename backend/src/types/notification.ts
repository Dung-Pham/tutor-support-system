/**
 * File: types/notification.ts
 * Mục đích: Notification types
 */

import { Document } from "mongoose";

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
