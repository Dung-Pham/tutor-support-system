/**
 * File: utils/messageHelper.ts
 * Mục đích: Helper functions cho Message feature
 */

import { Document, Types } from "mongoose";
import { IMessage, IParticipant } from "../types/index.js";

interface ConversationDocument extends Document {
  seenBy: { user: Types.ObjectId }[];
  lastMessageAt: Date;
  lastMessage?: {
    _id?: string;
    content: string;
    senderId: string;
    createdAt: Date;
  };
  participants: IParticipant[];
  unreadCounts: Map<string, number>;
}

export const updateConversationAfterCreateMessage = (
  conversation: ConversationDocument,
  message: IMessage,
  senderId: string
): void => {
  conversation.set({
    seenBy: [],
    lastMessageAt: message.createdAt,
    lastMessage: {
      _id: message._id?.toString(),
      content: message.content,
      senderId,
      createdAt: message.createdAt,
    },
  });

  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString();
    const isSender = memberId === senderId.toString();
    const prevCount = conversation.unreadCounts.get(memberId) || 0;
    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
  });
};
