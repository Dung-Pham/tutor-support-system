// CommentLike Model - SQL Server

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export interface CommentLikeAttributes {
  id: string;
  commentId: string;
  userId: string;
  createdAt: Date;
}

export interface CommentLikeCreationAttributes
  extends Optional<CommentLikeAttributes, "id" | "createdAt"> {}

class CommentLike
  extends Model<CommentLikeAttributes, CommentLikeCreationAttributes>
  implements CommentLikeAttributes
{
  declare id: string;
  declare commentId: string;
  declare userId: string;
  declare createdAt: Date;
}

CommentLike.init(
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "CommentLikes",
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ["comment_id"] },
      { fields: ["user_id"] },
      { unique: true, fields: ["comment_id", "user_id"] },
    ],
  }
);

export default CommentLike;
