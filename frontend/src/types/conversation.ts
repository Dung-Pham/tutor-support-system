/**
 * File: types/conversation.ts
 * Mục đích: Định nghĩa tất cả types liên quan đến Conversation
 */

import type { UserInfo } from './user';
import type { MessageResponse } from './message';

/**
 * Loại conversation
 */
export type ConversationType = 'direct' | 'group';

/**
 * Thông tin participant trong conversation
 */
export interface Participant {
  userId: string;
  joinedAt: string;
}

/**
 * Thông tin participant với chi tiết user
 */
export interface ParticipantWithUser extends Participant {
  user?: UserInfo;
}

/**
 * Thông tin group conversation
 */
export interface GroupInfo {
  name: string;
  createdBy: string;
}

/**
 * Thông tin message cuối cùng trong conversation
 */
export interface LastMessage {
  _id: string;
  content?: string;
  senderId: string;
  createdAt: string;
}

/**
 * Thông tin cơ bản của Conversation
 */
export interface Conversation {
  _id: string;
  type: ConversationType;
  participants: Participant[];
  group?: GroupInfo;
  lastMessageAt?: string;
  lastMessage?: LastMessage;
  unreadCounts: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Conversation chi tiết - dùng khi hiển thị conversation
 */
export interface ConversationDetail extends Conversation {
  participants: ParticipantWithUser[];
  lastMessage?: LastMessage & {
    sender?: UserInfo;
  };
  messages?: MessageResponse[];
}

/**
 * Conversation Preview - dùng khi hiển thị trong list
 */
export interface ConversationPreview {
  _id: string;
  type: ConversationType;
  name: string; // Group name hoặc display name của participant
  avatarUrl?: string;
  lastMessageContent?: string;
  lastMessageSender?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOnline?: boolean;
  participants: UserInfo[];
}

/**
 * Create Conversation Request
 */
export interface CreateConversationRequest {
  type: ConversationType;
  participantIds: string[];
  groupName?: string; // Bắt buộc nếu type = 'group'
}

/**
 * Update Conversation Request
 */
export interface UpdateConversationRequest {
  groupName?: string;
}

/**
 * Get Conversations Query
 */
export interface GetConversationsQuery {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'unread';
}

/**
 * Mark as Seen Request
 */
export interface MarkAsSeenRequest {
  conversationId: string;
}
