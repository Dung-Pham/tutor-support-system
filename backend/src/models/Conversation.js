import mongoose from "mongoose";

// Schema for conversation participants
// Each participant has a reference to a User and a timestamp of when they joined
const participantsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now, // Timestamp when user joined the conversation
    },
  },
  {
    _id: false, // Don't create _id field for subdocuments
  }
);

// Schema for group conversation details
// Only used when conversation type is "group"
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Group name is mandatory for group conversations
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User who created the group
    },
  },
  { _id: false } // Don't create _id field for subdocuments
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
// Supports both direct (1-on-1) and group conversations
const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"], // Conversation can be direct or group
      required: true,
    },
    participants: {
      type: [participantsSchema], // Array of participants with join timestamps
      required: true,
    },
    group: {
      type: groupSchema, // Group details (only populated for group conversations)
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
// Indexes participants and sorts by last message timestamp
conversationSchema.index({
  "participant.userId": 1, // Index on participant user IDs
  lastMessageAt: -1, // Sort by most recent messages first
});

// Create and export the Conversation model
const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
