export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imgUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageWithSender extends Message {
  sender?: {
    _id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface SendMessageRequest {
  conversationId: string;
  recipientId: string;
  content: string;
  imgUrls?: string[];
}

export interface GetMessagesQuery {
  conversationId: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest';
}

export interface MessageResponse {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imgUrls?: string[];
  createdAt: string;
  updatedAt: string;
}
