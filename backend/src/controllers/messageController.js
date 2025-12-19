import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";
import { emitToConversation, emitToUser } from "../config/socket.js";

export const sendDirectMessage = async (req, res) => {
  try {
    // Extract inputs
    const { recipientId, content, conversationId, imgUrls } = req.body;
    const senderId = req.user.id;

    let conversation;

    // Validate: message must have content or images
    if (!content && (!imgUrls || imgUrls.length === 0)) {
      return res
        .status(400)
        .json({ message: "Message must have content or images." });
    }

    // Validate: imgUrls must be an array if provided
    if (imgUrls && !Array.isArray(imgUrls)) {
      return res
        .status(400)
        .json({ message: "imgUrls must be an array of URLs." });
    }

    // Validate: maximum 10 images
    if (imgUrls && imgUrls.length > 10) {
      return res
        .status(400)
        .json({ message: "Cannot send more than 10 images per message." });
    }

    // If client provided a conversation ID, try to load it
    if (conversationId) {
      // Fetch existing conversation (may be null if not found)
      conversation = await Conversation.findById(conversationId);
    }

    // If no conversation exists yet, check if a direct conversation already exists between these two users
    if (!conversation) {
      // Find existing direct conversation between senderId and recipientId
      conversation = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [senderId, recipientId] },
      });
    }

    // If still no conversation found, create a new direct conversation
    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });
    }

    // Create the message linked to the conversation
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content: content || "", // Allow empty content if images are provided
      imgUrls: imgUrls || [],
    });

    // Update conversation metadata for the new message
    updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();

    // Emit real-time event to conversation room
    emitToConversation(conversation._id.toString(), "new_message", {
      message,
      conversationId: conversation._id,
    });

    // Also emit to recipient directly (in case they haven't joined the room yet)
    emitToUser(recipientId, "new_message", {
      message,
      conversationId: conversation._id,
    });

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Error in sendDirectMessage:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Send a message to a group conversation
// Expected payload: { conversationId, content, imgUrls }
// Behavior:
// 1. Validate inputs and that the user is a participant of the group
// 2. Create a Message document and update conversation metadata
export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content, imgUrls } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation; // Loaded by middleware

    // Validate: message must have content or images
    if (!content && (!imgUrls || imgUrls.length === 0)) {
      return res
        .status(400)
        .json({ message: "Message must have content or images." });
    }

    // Validate: imgUrls must be an array if provided
    if (imgUrls && !Array.isArray(imgUrls)) {
      return res
        .status(400)
        .json({ message: "imgUrls must be an array of URLs." });
    }

    // Validate: maximum 10 images
    if (imgUrls && imgUrls.length > 10) {
      return res
        .status(400)
        .json({ message: "Cannot send more than 10 images per message." });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content: content || "",
      imgUrls: imgUrls || [],
    });

    // Update conversation metadata for the new message
    updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();
    return res.status(201).json({ message });
  } catch (error) {
    console.error("Error in sendGroupMessage:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
