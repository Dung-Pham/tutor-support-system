/**
 * File: types/socket.ts
 * Mục đích: Socket.IO types
 */

import { IUserResponse } from "./user.js";

// ==========================================
// SOCKET TYPES
// ==========================================
export interface SocketUser {
  socketId: string;
  userData: IUserResponse;
}

export interface OnlineUsers {
  [userId: string]: SocketUser;
}

export interface TypingEvent {
  conversationId: string;
  isTyping: boolean;
}

export interface MessageSeenEvent {
  conversationId: string;
  messageId: string;
}
