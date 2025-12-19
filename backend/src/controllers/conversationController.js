import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const createConversation = async (req, res) => {
  try {
    // Extract type, name, and memberIds from request body
    const { type, name, memberIds } = req.body;
    // Get current user ID from request
    const userId = req.user._id;

    // Validate required fields for group and direct conversations
    if (
      !type ||
      (type === "group" && !name) ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0 ||
      !memberIds
    ) {
      // If missing required fields, return error
      return res.status(400).json({
        message:
          "Group name and member IDs are required for group conversations",
      });
    }

    let conversation;

    // Handle direct conversation creation or lookup
    if (type === "direct") {
      // Get the other participant's userId
      const participantId = memberIds[0];

      // Check if a direct conversation already exists between the two users
      conversation = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [userId, participantId] },
      });

      // If not found, create a new direct conversation
      if (!conversation) {
        conversation = new Conversation({
          type: "direct",
          participants: [{ userId }, { userId: participantId }],
          lastMessageAt: new Date(),
        });

        await conversation.save();
      }
    }

    // Handle group conversation creation
    if (type === "group") {
      // Create a new group conversation with all members
      conversation = new Conversation({
        type: "group",
        // Add current user and all memberIds as participants
        participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))],
        group: { name, createdBy: userId },
        lastMessageAt: new Date(),
      });

      await conversation.save();
    }

    // If conversation type is invalid, return error
    if (!conversation) {
      return res
        .status(500)
        .json({ message: "Conversation type is not valid." });
    }

    // Populate participant, seenBy, and lastMessage info for response
    await conversation.populate([
      { path: "participants.userId", select: "displayName avatarUrl" },
      {
        path: "seenBy",
        select: "displayName avatarUrl",
      },
      {
        path: "lastMessage.senderId",
        select: "displayName avatarUrl",
      },
    ]);

    // Return created or found conversation
    res.status(201).json({ conversation });
  } catch (error) {
    // Log error and return server error response
    console.error("Error in createConversation:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getConversations = async (req, res) => {
  try {
    // Get current user ID from request
    const userId = req.user._id;

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
      "participants.userId": userId,
    })
      // Sort by last message time (index will be used)
      .sort({ lastMessageAt: -1 })
      // Populate only essential participant info (removed seenBy and lastMessage.senderId for performance)
      .populate({
        path: "participants.userId",
        select: "displayName avatarUrl", // Only get needed fields
      })
      .lean(); // Convert to plain JS object (faster than Mongoose documents)

    // Format each conversation for response
    const formatted = conversations.map((convo) => {
      // Map participant info to a clean array
      const participants = (convo.participants || []).map((p) => ({
        id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinAt: p.joinedAt,
      }));

      // Return conversation object with formatted participants and unread counts
      // Note: Already lean object, no need to call toObject()
      return {
        ...convo,
        unreadCounts: convo.unreadCounts || {},
        participants,
      };
    });

    // Send formatted conversations to client
    return res.status(200).json({ conversations: formatted });
  } catch (error) {
    // Log error and return server error response
    console.error("Error in getConversations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getMessages = async (req, res) => {
  try {
    // Get conversationId from request params
    const { conversationId } = req.params;
    // Get pagination limit and cursor from query (default limit = 20)
    const { limit = 20, cursor } = req.query;

    // Build query to find messages in the conversation
    const query = { conversationId };

    // If cursor is provided, only fetch messages older than cursor
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    // Fetch messages, sorted by newest first, limit to (limit + 1) for pagination
    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1); // Fetch one extra to check for more

    let nextCursor = null;

    // If more messages than limit, set nextCursor for pagination
    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop(); // Remove the extra message
    }

    // Reverse messages to chronological order (oldest first)
    messages = messages.reverse();

    // Return messages and nextCursor for pagination
    return res.status(200).json({ messages, nextCursor });
  } catch (error) {
    // Log error and return server error response
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
