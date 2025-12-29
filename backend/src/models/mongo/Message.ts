// Message Model - MongoDB (links to SQL Server via conversationId)

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttachment {
  type: "image" | "video" | "file" | "audio";
  url: string;
  publicId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
}

export interface IMessage extends Document {
  conversationId: string; // UUID từ SQL Server Conversations.id
  senderId: string; // UUID từ SQL Server Users.id
  content?: string;
  attachments: IAttachment[];
  imgUrls: string[]; // Legacy support
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

const attachmentSchema = new Schema<IAttachment>(
  {
    type: {
      type: String,
      enum: ["image", "video", "file", "audio"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: String,
    fileName: String,
    fileSize: Number,
    mimeType: String,
    width: Number,
    height: Number,
    duration: Number,
    thumbnailUrl: String,
  },
  { _id: false }
);

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
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    imgUrls: {
      type: [String],
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
