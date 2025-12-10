/**
 * File: types/message.ts
 * Mục đích: Định nghĩa tất cả types liên quan đến Message
 */

/**
 * Loại nội dung message
 */
export type MessageType = 'text' | 'image' | 'file' | 'system';

/**
 * Trạng thái delivery của message
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

/**
 * Thông tin cơ bản của Message
 */
export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imgUrls?: string[];
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Message với thông tin sender
 */
export interface MessageWithSender extends Message {
  sender?: {
    _id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

/**
 * Send Message Request
 */
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  imgUrls?: string[];
}

/**
 * Get Messages Query
 */
export interface GetMessagesQuery {
  conversationId: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest';
}

/**
 * Message Response từ API
 */
export interface MessageResponse {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imgUrls?: string[];
  createdAt: string;
  updatedAt: string;
}
