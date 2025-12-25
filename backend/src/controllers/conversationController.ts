/**
 * File: conversationController.ts
 * Má»¥c Ä‘Ã­ch: Controller cho Conversation feature (SQL Server + MongoDB)
 * Conversation, Participant: SQL Server
 * Message: MongoDB
 */

import { Response } from "express";
import { Conversation, Participant, User } from "../models/sql/index.js";
import { Message } from "../models/mongo/index.js";
import { AuthRequest } from "../types/common.js";
import { Op } from "sequelize";

interface CreateConversationBody {
  type: "direct" | "group";
  name?: string;
  memberIds: string[];
}

interface ConversationParams {
  conversationId: string;
}

interface GetMessagesQuery {
  limit?: string;
  cursor?: string;
}

// Táº¡o conversation má»›i
export const createConversation = async (
  req: AuthRequest & { body: CreateConversationBody },
  res: Response
): Promise<Response> => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!type || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        message: "Type and member IDs are required",
      });
    }

    if (type === "group" && !name) {
      return res.status(400).json({
        message: "Group name is required for group conversations",
      });
    }

    let conversation;

    if (type === "direct") {
      const participantId = memberIds[0];

      // Check if direct conversation already exists between these users
      const existingConversations = await Conversation.findAll({
        where: { type: "direct" },
        include: [
          {
            model: Participant,
            as: "participants",
            where: {
              userId: { [Op.in]: [userId, participantId] },
            },
          },
        ],
      });

      // Find conversation that has both participants
      for (const conv of existingConversations) {
        const participants = await Participant.findAll({
          where: { conversationId: conv.id },
        });
        const participantIds = participants.map((p) => p.userId);
        if (
          participantIds.includes(userId) &&
          participantIds.includes(participantId)
        ) {
          conversation = conv;
          break;
        }
      }

      if (!conversation) {
        // Create new direct conversation
        conversation = await Conversation.create({
          type: "direct",
          lastMessageAt: new Date(),
        });

        // Add participants
        await Participant.bulkCreate([
          { conversationId: conversation.id, userId },
          { conversationId: conversation.id, userId: participantId },
        ]);
      }
    } else {
      // Group conversation
      conversation = await Conversation.create({
        type: "group",
        name,
        lastMessageAt: new Date(),
      });

      // Add all members including creator
      const allMemberIds = [...new Set([userId, ...memberIds])];
      await Participant.bulkCreate(
        allMemberIds.map((memberId) => ({
          conversationId: conversation!.id,
          userId: memberId,
        }))
      );
    }

    // Reload with participants
    const fullConversation = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: Participant,
          as: "participants",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "displayName", "avatarUrl"],
            },
          ],
        },
      ],
    });

    return res
      .status(201)
      .json({
        success: true,
        message: "Conversation created",
        data: fullConversation,
      });
  } catch (error) {
    console.error("Error in createConversation", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// Láº¥y danh sÃ¡ch conversations
export const getConversations = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get conversation IDs where user is a participant
    const userParticipations = await Participant.findAll({
      where: { userId },
      attributes: ["conversationId"],
    });

    const conversationIds = userParticipations.map((p) => p.conversationId);

    // Get full conversations with participants
    const conversations = await Conversation.findAll({
      where: { id: { [Op.in]: conversationIds } },
      include: [
        {
          model: Participant,
          as: "participants",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "displayName", "avatarUrl"],
            },
          ],
        },
      ],
      order: [["lastMessageAt", "DESC"]],
    });

    // Format response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = conversations.map((conv: any) => {
      const convJson = conv.toJSON();
      return {
        ...convJson,
        participants: convJson.participants?.map(
          (p: {
            user?: { id: string; displayName: string; avatarUrl?: string };
            joinedAt?: Date;
          }) => ({
            id: p.user?.id,
            displayName: p.user?.displayName,
            avatarUrl: p.user?.avatarUrl ?? null,
            joinAt: p.joinedAt,
          })
        ),
      };
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "Conversations retrieved",
        data: formatted,
      });
  } catch (error) {
    console.error("Error in getConversations", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// Láº¥y messages cá»§a conversation (tá»« MongoDB)
export const getMessages = async (
  req: AuthRequest & { params: ConversationParams; query: GetMessagesQuery },
  res: Response
): Promise<Response> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit || "20", 10);
    const { cursor } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify conversation exists
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    // Verify user is a participant
    const isParticipant = await Participant.findOne({
      where: { conversationId, userId },
    });
    if (!isParticipant) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not a member of this conversation",
        });
    }

    // Build query for MongoDB messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { conversationId };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    let nextCursor: string | null = null;

    if (messages.length > limit) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop();
    }

    messages = messages.reverse();

    // Get sender info from SQL
    const senderIds = [...new Set(messages.map((m) => m.senderId))];
    const senders = await User.findAll({
      where: { id: { [Op.in]: senderIds } },
      attributes: ["id", "displayName", "avatarUrl"],
    });

    const senderMap = new Map(senders.map((s) => [s.id, s.toJSON()]));

    // Attach sender info to messages
    const messagesWithSender = messages.map((m) => ({
      ...m,
      sender: senderMap.get(m.senderId) || null,
    }));

    return res
      .status(200)
      .json({ success: true, data: messagesWithSender, nextCursor });
  } catch (error) {
    console.error("Error in getMessages", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// Mark conversation as seen (reset unread count)
export const markConversationAsSeen = async (
  req: AuthRequest & { params: ConversationParams },
  res: Response
): Promise<Response> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify user is a participant
    const participant = await Participant.findOne({
      where: { conversationId, userId },
    });

    if (!participant) {
      return res
        .status(403)
        .json({ message: "You are not a member of this conversation" });
    }

    // Reset unread count
    await Participant.update(
      { unreadCount: 0 },
      { where: { conversationId, userId } }
    );

    // Mark all messages in this conversation as read by this user
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        "readBy.userId": { $ne: userId },
      },
      {
        $push: { readBy: { userId, readAt: new Date() } },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Conversation marked as seen",
    });
  } catch (error) {
    console.error("Error in markConversationAsSeen", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
