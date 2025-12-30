export type MessageType = 'text' | 'image' | 'video' | 'file' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

export interface FileAttachment {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imgUrls?: string[];
  videoUrl?: string;
  fileUrls?: FileAttachment[];
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
  videoUrl?: string;
  fileUrls?: FileAttachment[];
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
  videoUrl?: string;
  fileUrls?: FileAttachment[];
  createdAt: string;
  updatedAt: string;
}
