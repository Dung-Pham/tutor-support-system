import type { UserInfo, UserRole } from './user';
import type { MessageResponse } from './message';

export type ConversationType = 'direct' | 'group';

/**
 * Participant trong conversation (format từ API response)
 * Backend trả về participant với thông tin user đã được flatten
 */
export interface Participant {
  id: string; // User ID
  displayName?: string;
  name?: string; // Backend trả về name từ DB
  avatarUrl?: string | null;
  joinAt?: string; // ISO date string
  role?: UserRole;
  lastSeenAt?: string;
}

export interface ParticipantWithUser extends Participant {
  user?: UserInfo;
}

export interface LastMessage {
  _id: string;
  content?: string;
  senderId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  avatarUrl?: string;
  createdBy?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  lastMessageSenderId?: string;
  lastMessage?: LastMessage;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends Conversation {
  participants: ParticipantWithUser[];
  lastMessage?: LastMessage & {
    sender?: UserInfo;
  };
  messages?: MessageResponse[];
}

export interface ConversationPreview {
  id: string;
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

export interface CreateConversationRequest {
  type: ConversationType;
  name?: string;
  memberIds: string[];
}

/**
 * Get Conversations Query
 */
export interface GetConversationsQuery {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'unread';
}

export interface MarkAsSeenRequest {
  conversationId: string;
}
