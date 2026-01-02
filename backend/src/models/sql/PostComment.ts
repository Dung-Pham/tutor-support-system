// PostComment Model - SQL Server

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export type CommentStatus = "active" | "deleted";

export interface PostCommentAttributes {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostCommentCreationAttributes
  extends Optional<
    PostCommentAttributes,
    | "id"
    | "likeCount"
    | "replyCount"
    | "isEdited"
    | "status"
    | "createdAt"
    | "updatedAt"
  > {}

class PostComment
  extends Model<PostCommentAttributes, PostCommentCreationAttributes>
  implements PostCommentAttributes
{
  declare id: string;
  declare postId: string;
  declare userId: string;
  declare content: string;
  declare likeCount: number;
  declare replyCount: number;
  declare isEdited: boolean;
  declare status: CommentStatus;
  declare createdAt: Date;
  declare updatedAt: Date;
}

PostComment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "post_id",
      references: {
        model: "PostHeaders",
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "like_count",
    },
    replyCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "reply_count",
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
    tableName: "PostComments",
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ["post_id", "created_at"] }, { fields: ["user_id"] }],
  }
);

export default PostComment;
