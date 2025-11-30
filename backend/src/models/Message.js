import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation", // Reference to the conversation this message belongs to
      required: true,
      index: true, // Index for faster queries by conversation
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
      type: String, // Array of image URLs associated with the message
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

messageSchema.index({ ConversationId: 1, createdAt: -1 }); // Index for efficient retrieval of messages in a conversation sorted by time

const Message = mongoose.model("Message", messageSchema);

export default Message;
