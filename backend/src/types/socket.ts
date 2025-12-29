// Socket.IO Types

import { IUserResponse } from "./user.js";

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
