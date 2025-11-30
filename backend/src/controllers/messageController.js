import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";

export const sendDirectMessage = async (req, res) => {
  try {
    // Extract inputs
    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user.id;

    let conversation;

    // Validate: message content must not be empty
    if (!content) {
      return res
        .status(400)
        .json({ message: "Message content cannot be empty." });
    }

    // If client provided a conversation ID, try to load it
    if (conversationId) {
      // Fetch existing conversation (may be null if not found)
      conversation = await Conversation.findById(conversationId);
    }

    // If no conversation exists yet, create a new direct conversation
    // Note: In a production system you may want to check for an existing
    // direct conversation between the two users instead of always creating one.
    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        // lastMessage should be a sub-document; here we set lastMessageAt timestamp
        lastMessageAt: new Date(),
        // unreadCount map will be updated when messages are created
        unreadCount: new Map(),
      });
    }

    // Create the message linked to the conversation
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
    });

    // Update conversation metadata for the new message
    updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Error in sendDirectMessage:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Send a message to a group conversation
// Expected payload: { conversationId, content }
// Behavior:
// 1. Validate inputs and that the user is a participant of the group
// 2. Create a Message document and update conversation metadata
export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation; // Loaded by middleware

    if (!content) {
      return res
        .status(400)
        .json({ message: "Message content cannot be empty." });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content,
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
