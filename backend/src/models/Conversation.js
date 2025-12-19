import mongoose from "mongoose";

// Schema for conversation participants
// Simple array of user IDs for direct conversations
const participantsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
  },
  {
    _id: false, // Don't create _id field for subdocuments
  }
);

// Schema for the last message in a conversation
// Used for displaying conversation previews and sorting
const lastMessageSchema = new mongoose.Schema(
  {
    _id: { type: String }, // Message ID
    content: { type: String, default: null }, // Message content (can be null for media-only messages)
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Who sent the last message
    },
    createdAt: { type: Date, default: null }, // When the last message was sent
  },
  {
    _id: false, // Don't create _id field for subdocuments
  }
);

// Main conversation schema
// Only supports direct (1-on-1) conversations
const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct"], // Only direct conversations
      default: "direct",
      required: true,
    },
    participants: {
      type: [participantsSchema], // Array of 2 participants for direct chat
      required: true,
      validate: {
        validator: function (v) {
          return v.length === 2; // Direct conversations must have exactly 2 participants
        },
        message: "Direct conversations must have exactly 2 participants",
      },
    },
    lastMessageAt: {
      type: Date, // Timestamp of the last message for sorting conversations
    },
    seenBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Users who have seen the conversation
        },
      },
    ],
    lastMessage: {
      type: lastMessageSchema, // Details of the most recent message
      ref: "Message", // Reference to Message model
    },
    unreadCounts: {
      type: Map, // Map of user IDs to their unread message count
      of: Number,
      default: {}, // Initialize as empty object
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Database index for efficient querying
// Compound index: Find by user AND sort by timestamp in one operation
conversationSchema.index({
  "participants.userId": 1, // Index on participant user IDs (FIXED: was "participant")
  lastMessageAt: -1, // Sort by most recent messages first (descending)
});

// Create and export the Conversation model
const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
