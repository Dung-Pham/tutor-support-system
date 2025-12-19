import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation", // Reference to the conversation this message belongs to
      required: true,
      // Removed: index: true - Using compound index below instead
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user who sent the message
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    imgUrls: {
      type: [String], // Array of image URLs associated with the message
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 10; // Maximum 10 images per message
        },
        message: "Cannot send more than 10 images per message",
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Compound index for efficient message retrieval
// Note: Remove duplicate index - conversationId already has index: true above
messageSchema.index({ conversationId: 1, createdAt: -1 }); // FIXED: was "ConversationId"

const Message = mongoose.model("Message", messageSchema);

export default Message;
