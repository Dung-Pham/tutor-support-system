// Message & Conversation Types

import { Document, Types } from "mongoose";

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
// MESSAGE REQUEST TYPES
// ==========================================
export interface SendDirectMessageData {
  recipientId: string;
  content?: string;
  conversationId?: string;
  imgUrls?: string[];
}

export interface SendGroupMessageData {
  conversationId: string;
  content?: string;
  imgUrls?: string[];
}
