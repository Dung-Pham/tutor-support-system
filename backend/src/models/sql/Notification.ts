// Notification Model - SQL Server

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export type NotificationType =
  | "post_liked"
  | "post_commented"
  | "comment_replied"
  | "comment_liked"
  | "post_approved"
  | "post_rejected"
  | "new_message"
  | "new_follower"
  | "system";

export interface NotificationAttributes {
  id: string;
  recipientId: string;
  senderId?: string | null;
  type: NotificationType;
  title?: string | null;
  message?: string | null;
  postId?: string | null;
  commentId?: string | null;
  conversationId?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
}

export interface NotificationCreationAttributes
  extends Optional<
    NotificationAttributes,
    | "id"
    | "senderId"
    | "title"
    | "message"
    | "postId"
    | "commentId"
    | "conversationId"
    | "isRead"
    | "readAt"
    | "createdAt"
  > {}

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  declare id: string;
  declare recipientId: string;
  declare senderId: string | null;
  declare type: NotificationType;
  declare title: string | null;
  declare message: string | null;
  declare postId: string | null;
  declare commentId: string | null;
  declare conversationId: string | null;
  declare isRead: boolean;
  declare readAt: Date | null;
  declare createdAt: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "recipient_id",
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "sender_id",
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [
          [
            "post_liked",
            "post_commented",
            "comment_replied",
            "comment_liked",
            "post_approved",
            "post_rejected",
            "new_message",
            "new_follower",
            "system",
          ],
        ],
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    message: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "post_id",
      references: {
        model: "PostHeaders",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "comment_id",
      references: {
        model: "PostComments",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "conversation_id",
      references: {
        model: "Conversations",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_read",
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "read_at",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "Notifications",
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ["recipient_id", "is_read", "created_at"] },
      { fields: ["created_at"] },
    ],
  }
);

export default Notification;
