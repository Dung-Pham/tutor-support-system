// Middleware to check friendship status before allowing message or group actions
// Import required models
import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";

// Helper function to consistently order two user IDs for friendship lookup
// Ensures that (A, B) and (B, A) are treated the same
const pair = (a, b) => (a < b ? [a, b] : [b, a]);

export const checkFriendship = async (req, res, next) => {
  try {
    // Get current user ID from request
    const me = req.user._id.toString();
    // Get recipient ID for direct message (if any)
    const recipientId = req.body?.recipientId ?? null;
    // Get member IDs for group message (if any)
    const memberIds = req.body?.memberIds ?? [];

    // Must provide either recipientId (for direct) or memberIds (for group)
    if (!recipientId && memberIds.length === 0) {
      return res
        .status(400)
        .json({ message: "You must provide recipientId or memberIds." });
    }

    // Check friendship for direct message
    if (recipientId) {
      // Order user IDs for consistent lookup
      const [userA, userB] = pair(me, recipientId);

      // Find friendship document in database
      const isFriend = await Friend.findOne({ userA, userB });

      // If not friends, block the action
      if (!isFriend) {
        return res
          .status(403)
          .json({ message: "You are not friends with this user." });
      }

      // Friendship exists, allow next middleware/handler
      return next();
    }

    // For group message, check friendship with each member
    const friendChecks = memberIds.map(async (memberId) => {
      // Order user IDs for consistent lookup
      const [userA, userB] = pair(me, memberId);
      // Find friendship document
      const friend = await Friend.findOne({ userA, userB });
      // If not friends, return memberId
      return friend ? null : { memberId, userA, userB, friend };
    });

    // Wait for all friendship checks to complete
    const results = await Promise.all(friendChecks);
    // Filter out members who are not friends
    const notFriends = results.filter(Boolean);

    // If any non-friends found, block the action and report them
    if (notFriends.length > 0) {
      return res.status(403).json({
        message: "You can only add friends to the group.",
        notFriends,
      });
    }

    // All friendships valid, allow next middleware/handler
    next();
  } catch (error) {
    // Log error and respond with server error
    console.error("Error in checkFriendship:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Middleware to check if user is a member of a group conversation
export const checkGroupMembership = async (req, res, next) => {
  try {
    // Get conversationId from request body
    const { conversationId } = req.body;
    // Get current user ID
    const userId = req.user._id;

    // Find the conversation in database
    const conversation = await Conversation.findById(conversationId);

    // If conversation not found, block the action
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    // Check if current user is a participant in the conversation
    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    // If not a member, block the action
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group." });
    }

    // Attach conversation to request for downstream handlers
    req.conversation = conversation;

    // Allow next middleware/handler
    next();
  } catch (error) {
    // Log error and respond with server error
    console.error("Error in checkGroupMembership:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
