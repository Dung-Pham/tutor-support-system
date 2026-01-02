// ReplyComment Model - SQL Server

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export type ReplyStatus = "active" | "deleted";

export interface ReplyCommentAttributes {
  id: string;
  commentId: string;
  userId: string;
  mentionedUserId: string | null;
  content: string;
  likeCount: number;
  isEdited: boolean;
  status: ReplyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReplyCommentCreationAttributes
  extends Optional<
    ReplyCommentAttributes,
    | "id"
    | "mentionedUserId"
    | "likeCount"
    | "isEdited"
    | "status"
    | "createdAt"
    | "updatedAt"
  > {}

class ReplyComment
  extends Model<ReplyCommentAttributes, ReplyCommentCreationAttributes>
  implements ReplyCommentAttributes
{
  declare id: string;
  declare commentId: string;
  declare userId: string;
  declare mentionedUserId: string | null;
  declare content: string;
  declare likeCount: number;
  declare isEdited: boolean;
  declare status: ReplyStatus;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ReplyComment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "comment_id",
      references: {
        model: "PostComments",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: "UserAccount",
        key: "user_id",
      },
    },
    mentionedUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "mentioned_user_id",
      references: {
        model: "UserAccount",
        key: "user_id",
      },
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "like_count",
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_edited",
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
      validate: {
        isIn: [["active", "deleted"]],
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
    tableName: "ReplyComments",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["comment_id", "created_at"] },
      { fields: ["user_id"] },
    ],
  }
);

export default ReplyComment;
