// Message Controller - MongoDB (Message) + SQL Server (Conversation)

import { Response } from "express";
import { Conversation, Participant, User } from "../models/sql/index.js";
import { Message } from "../models/mongo/index.js";
import { emitToConversation, emitToUser } from "../config/socket.js";
import { AuthRequest } from "../types/common.js";
import { Op } from "sequelize";

interface FileAttachment {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface SendDirectMessageBody {
  recipientId: string;
  content?: string;
  conversationId?: string;
  imgUrls?: string[];
  videoUrl?: string;
  fileUrls?: FileAttachment[];
}

interface SendGroupMessageBody {
  conversationId: string;
  content?: string;
  imgUrls?: string[];
  videoUrl?: string;
  fileUrls?: FileAttachment[];
}

// Send a direct message
export const sendDirectMessage = async (
  req: AuthRequest & { body: SendDirectMessageBody },
  res: Response
): Promise<Response> => {
  try {
    const {
      recipientId,
      content,
      conversationId,
      imgUrls,
      videoUrl,
      fileUrls,
    } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (
      !content &&
      (!imgUrls || imgUrls.length === 0) &&
      !videoUrl &&
      (!fileUrls || fileUrls.length === 0)
    ) {
      return res.status(400).json({
        message: "Message must have content, images, video, or files.",
      });
    }

    if (imgUrls && !Array.isArray(imgUrls)) {
      return res
        .status(400)
        .json({ message: "imgUrls must be an array of URLs." });
    }

    if (imgUrls && imgUrls.length > 10) {
      return res
        .status(400)
        .json({ message: "Cannot send more than 10 images per message." });
    }

    let conversation;

    // Try to find existing conversation
    if (conversationId) {
      conversation = await Conversation.findByPk(conversationId);
    }

    if (!conversation) {
      // Find direct conversation between sender and recipient
      const senderParticipations = await Participant.findAll({
        where: { userId: senderId },
        attributes: ["conversationId"],
      });

      const conversationIds = senderParticipations.map((p) => p.conversationId);

      const existingConversation = await Conversation.findOne({
        where: {
          id: { [Op.in]: conversationIds },
          type: "direct",
        },
        include: [
          {
            model: Participant,
            as: "participants",
            where: { userId: recipientId },
          },
        ],
      });

      conversation = existingConversation;
    }

    if (!conversation) {
      // Create new direct conversation
      conversation = await Conversation.create({
        type: "direct",
        lastMessageAt: new Date(),
      });

      await Participant.bulkCreate([
        { conversationId: conversation.id, userId: senderId },
        { conversationId: conversation.id, userId: recipientId },
      ]);
    }

    // Create message in MongoDB
    const message = await Message.create({
      conversationId: conversation.id,
      senderId,
      content: content || "",
      imgUrls: imgUrls || [],
      videoUrl: videoUrl || undefined,
      fileUrls: fileUrls || [],
    });

    // Update conversation's last message timestamp and preview
    const messagePreview = content 
      ? content.substring(0, 100) 
      : imgUrls?.length 
        ? '📷 Hình ảnh' 
        : videoUrl 
          ? '🎬 Video' 
          : fileUrls?.length 
            ? '📎 Tệp đính kèm' 
            : '';
    
    await conversation.update({
      lastMessageAt: new Date(),
      lastMessagePreview: messagePreview,
      lastMessageSenderId: senderId,
    });

    // Increment unread count for recipient
    await Participant.increment("unreadCount", {
      where: {
        conversationId: conversation.id,
        userId: recipientId,
      },
    });

    // Emit socket events
    emitToConversation(conversation.id, "new_message", {
      message,
      conversationId: conversation.id,
    });

    emitToUser(recipientId, "new_message", {
      message,
      conversationId: conversation.id,
    });

    return res
      .status(201)
      .json({ success: true, message: "Message sent", data: message });
  } catch (error) {
    console.error("Error in sendDirectMessage", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Send a message to a group conversation
export const sendGroupMessage = async (
  req: AuthRequest & { body: SendGroupMessageBody },
  res: Response
): Promise<Response> => {
  try {
    const { conversationId, content, imgUrls } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const isParticipant = await Participant.findOne({
      where: { conversationId, userId: senderId },
    });

    if (!isParticipant) {
      return res
        .status(403)
        .json({ message: "You are not a member of this conversation" });
    }

    if (!content && (!imgUrls || imgUrls.length === 0)) {
      return res
        .status(400)
        .json({ message: "Message must have content or images." });
    }

    if (imgUrls && !Array.isArray(imgUrls)) {
      return res
        .status(400)
        .json({ message: "imgUrls must be an array of URLs." });
    }

    if (imgUrls && imgUrls.length > 10) {
      return res
        .status(400)
        .json({ message: "Cannot send more than 10 images per message." });
    }

    // Create message in MongoDB
    const message = await Message.create({
      conversationId,
      senderId,
      content: content || "",
      imgUrls: imgUrls || [],
    });

    // Update conversation's last message timestamp and preview
    const messagePreview = content 
      ? content.substring(0, 100) 
      : imgUrls?.length 
        ? '📷 Hình ảnh' 
        : '';
    
    await conversation.update({
      lastMessageAt: new Date(),
      lastMessagePreview: messagePreview,
      lastMessageSenderId: senderId,
    });

    // Increment unread count for all participants except sender
    await Participant.increment("unreadCount", {
      where: {
        conversationId,
        userId: { [Op.ne]: senderId },
      },
    });

    // Emit to conversation room
    emitToConversation(conversationId, "new_message", {
      message,
      conversationId,
    });

    return res
      .status(201)
      .json({ success: true, message: "Message sent", data: message });
  } catch (error) {
    console.error("Error in sendGroupMessage", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Mark a single message as seen
export const markMessageAsSeen = async (
  req: AuthRequest & { params: { messageId: string } },
  res: Response
): Promise<Response> => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Verify user is a participant of this conversation
    const isParticipant = await Participant.findOne({
      where: { conversationId: message.conversationId, userId },
    });
    if (!isParticipant) {
      return res
        .status(403)
        .json({ message: "You are not a member of this conversation" });
    }

    // Check if user already read this message
    const alreadyRead = message.readBy.some((r) => r.userId === userId);
    if (!alreadyRead) {
      message.readBy.push({ userId, readAt: new Date() });
      await message.save();
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as seen",
    });
  } catch (error) {
    console.error("Error in markMessageAsSeen", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Delete a message
export const deleteMessage = async (
  req: AuthRequest & { params: { messageId: string } },
  res: Response
): Promise<Response> => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Only sender can delete their message
    if (message.senderId !== userId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You can only delete your own messages",
        });
    }

    // Soft delete - mark as deleted instead of removing
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = "";
    message.imgUrls = [];
    message.videoUrl = undefined;
    message.fileUrls = [];
    await message.save();

    // Emit socket event for real-time update
    emitToConversation(message.conversationId, "message_deleted", {
      messageId,
      conversationId: message.conversationId,
    });

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteMessage", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Edit a message
export const editMessage = async (
  req: AuthRequest & {
    params: { messageId: string };
    body: { content: string };
  },
  res: Response
): Promise<Response> => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!content || content.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Content is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Only sender can edit their message
    if (message.senderId !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own messages" });
    }

    // Cannot edit deleted messages
    if (message.isDeleted) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot edit a deleted message" });
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    // Emit socket event for real-time update
    emitToConversation(message.conversationId, "message_edited", {
      messageId,
      content: message.content,
      conversationId: message.conversationId,
    });

    return res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error in editMessage", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
