// ReplyCommentLike Model - SQL Server

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export interface ReplyCommentLikeAttributes {
  id: string;
  replyId: string;
  userId: string;
  createdAt: Date;
}

export interface ReplyCommentLikeCreationAttributes
  extends Optional<ReplyCommentLikeAttributes, "id" | "createdAt"> {}

class ReplyCommentLike
  extends Model<ReplyCommentLikeAttributes, ReplyCommentLikeCreationAttributes>
  implements ReplyCommentLikeAttributes
{
  declare id: string;
  declare replyId: string;
  declare userId: string;
  declare createdAt: Date;
}

ReplyCommentLike.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    replyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "reply_id",
      references: {
        model: "ReplyComments",
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "ReplyCommentLikes",
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ["reply_id"] },
      { fields: ["user_id"] },
      { unique: true, fields: ["reply_id", "user_id"] },
    ],
  }
);

export default ReplyCommentLike;
