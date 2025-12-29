// Conversation Model - SQL Server

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export type ConversationType = "direct" | "group";

export interface ConversationAttributes {
  id: string;
  type: ConversationType;
  name?: string | null;
  avatarUrl?: string | null;
  createdBy?: string | null;
  lastMessageAt?: Date | null;
  lastMessagePreview?: string | null;
  lastMessageSenderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationCreationAttributes
  extends Optional<
    ConversationAttributes,
    | "id"
    | "type"
    | "name"
    | "avatarUrl"
    | "createdBy"
    | "lastMessageAt"
    | "lastMessagePreview"
    | "lastMessageSenderId"
    | "createdAt"
    | "updatedAt"
  > {}

class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  declare id: string;
  declare type: ConversationType;
  declare name: string | null;
  declare avatarUrl: string | null;
  declare createdBy: string | null;
  declare lastMessageAt: Date | null;
  declare lastMessagePreview: string | null;
  declare lastMessageSenderId: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "direct",
      validate: {
        isIn: [["direct", "group"]],
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "avatar_url",
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "created_by",
      references: {
        model: "Users",
        key: "id",
      },
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_message_at",
    },
    lastMessagePreview: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "last_message_preview",
    },
    lastMessageSenderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "last_message_sender_id",
      references: {
        model: "Users",
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "Conversations",
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ["last_message_at"] }, { fields: ["created_at"] }],
  }
);

export default Conversation;
