import type { UserInfo } from './user';
import type { MessageResponse } from './message';

export type ConversationType = 'direct';

export interface Participant {
  userId: string;
  joinedAt: string;
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
  _id: string;
  type: ConversationType;
  participants: Participant[];
  lastMessageAt?: string;
  lastMessage?: LastMessage;
  unreadCounts: Record<string, number>;
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

export interface CreateConversationRequest {
  type: ConversationType;
  participantIds: string[];
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
