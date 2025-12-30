// Message Model - MongoDB (links to SQL Server via conversationId)

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  conversationId: string; // UUID từ SQL Server Conversations.id
  senderId: string; // UUID từ SQL Server Users.id
  content?: string;
  imgUrls: string[]; // Image URLs
  videoUrl?: string; // Video URL
  fileUrls?: Array<{
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>; // File attachments
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      default: "",
    },
    imgUrls: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
    },
    fileUrls: {
      type: [
        {
          url: { type: String, required: true },
          fileName: { type: String, required: true },
          fileSize: { type: Number, required: true },
          mimeType: { type: String, required: true },
        },
      ],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    readBy: [
      {
        userId: { type: String, required: true },
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    collection: "messages",
  }
);

// Compound index for efficient message retrieval
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

const Message: Model<IMessage> = mongoose.model<IMessage>(
  "Message",
  messageSchema
);

export default Message;
