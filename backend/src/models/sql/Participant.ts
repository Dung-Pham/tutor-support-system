/**
 * File: models/sql/Participant.ts
 * Mục đích: Sequelize model cho Participants table (Junction)
 */

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export type ParticipantRole = "member" | "admin";

export interface ParticipantAttributes {
  id: string;
  conversationId: string;
  userId: string;
  role: ParticipantRole;
  nickname?: string | null;
  isMuted: boolean;
  isPinned: boolean;
  unreadCount: number;
  lastReadAt?: Date | null;
  joinedAt: Date;
  leftAt?: Date | null;
}

export interface ParticipantCreationAttributes
  extends Optional<
    ParticipantAttributes,
    | "id"
    | "role"
    | "nickname"
    | "isMuted"
    | "isPinned"
    | "unreadCount"
    | "lastReadAt"
    | "joinedAt"
    | "leftAt"
  > {}

class Participant
  extends Model<ParticipantAttributes, ParticipantCreationAttributes>
  implements ParticipantAttributes
{
  declare id: string;
  declare conversationId: string;
  declare userId: string;
  declare role: ParticipantRole;
  declare nickname: string | null;
  declare isMuted: boolean;
  declare isPinned: boolean;
  declare unreadCount: number;
  declare lastReadAt: Date | null;
  declare joinedAt: Date;
  declare leftAt: Date | null;
}

Participant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "conversation_id",
      references: {
        model: "Conversations",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: "Users",
        key: "id",
      },
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "member",
      validate: {
        isIn: [["member", "admin"]],
      },
    },
    nickname: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isMuted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_muted",
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_pinned",
    },
    unreadCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "unread_count",
    },
    lastReadAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_read_at",
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "joined_at",
    },
    leftAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "left_at",
    },
  },
  {
    sequelize,
    tableName: "Participants",
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ["conversation_id"] },
      { fields: ["user_id", "is_pinned", "last_read_at"] },
      { unique: true, fields: ["conversation_id", "user_id"] },
    ],
  }
);

export default Participant;
