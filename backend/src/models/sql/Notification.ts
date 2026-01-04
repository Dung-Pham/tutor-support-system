// Notification Model - SQL Server
// Updated to match schema.sql

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

// Types matching schema CHECK constraint would be defined at DB level
export type NotificationType = string;

export interface NotificationAttributes {
  id: string;
  receiverId: string; // Schema uses receiver_id
  senderId?: string | null;
  type: NotificationType;
  title: string;
  content?: string | null;
  link?: string | null;
  isRead: boolean;
  metadata?: string | null; // JSON string
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface NotificationCreationAttributes extends Optional<
  NotificationAttributes,
  | "id"
  | "senderId"
  | "content"
  | "link"
  | "isRead"
  | "metadata"
  | "createdAt"
  | "updatedAt"
> {}

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  declare id: string;
  declare receiverId: string;
  declare senderId: string | null;
  declare type: NotificationType;
  declare title: string;
  declare content: string | null;
  declare link: string | null;
  declare isRead: boolean;
  declare metadata: string | null;
  declare createdAt: Date;
  declare updatedAt: Date | null;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "notification_id",
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "receiver_id",
      references: {
        model: "UserAccount",
        key: "user_id",
      },
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "sender_id",
      references: {
        model: "UserAccount",
        key: "user_id",
      },
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: "is_read",
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "Notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["receiver_id"] },
      { fields: ["sender_id"] },
      { fields: ["type"] },
      { fields: ["is_read"] },
    ],
  }
);

export default Notification;
