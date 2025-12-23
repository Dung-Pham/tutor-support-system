/**
 * File: models/sql/PostHeader.ts
 * Mục đích: Sequelize model cho PostHeaders table
 */

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export type PostStatus = "draft" | "pending" | "approved" | "rejected";

export interface PostHeaderAttributes {
  id: string;
  title: string;
  slug: string;
  authorId: string;
  status: PostStatus;
  rejectionReason?: string | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  rejectedBy?: string | null;
  rejectedAt?: Date | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostHeaderCreationAttributes
  extends Optional<
    PostHeaderAttributes,
    | "id"
    | "status"
    | "rejectionReason"
    | "approvedBy"
    | "approvedAt"
    | "rejectedBy"
    | "rejectedAt"
    | "viewCount"
    | "likeCount"
    | "commentCount"
    | "createdAt"
    | "updatedAt"
  > {}

class PostHeader
  extends Model<PostHeaderAttributes, PostHeaderCreationAttributes>
  implements PostHeaderAttributes
{
  declare id: string;
  declare title: string;
  declare slug: string;
  declare authorId: string;
  declare status: PostStatus;
  declare rejectionReason: string | null;
  declare approvedBy: string | null;
  declare approvedAt: Date | null;
  declare rejectedBy: string | null;
  declare rejectedAt: Date | null;
  declare viewCount: number;
  declare likeCount: number;
  declare commentCount: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

PostHeader.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "author_id",
      references: {
        model: "Users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "draft",
      validate: {
        isIn: [["draft", "pending", "approved", "rejected"]],
      },
    },
    rejectionReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "rejection_reason",
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "approved_by",
      references: {
        model: "Users",
        key: "id",
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "approved_at",
    },
    rejectedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "rejected_by",
      references: {
        model: "Users",
        key: "id",
      },
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "rejected_at",
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "view_count",
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "like_count",
    },
    commentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "comment_count",
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
    tableName: "PostHeaders",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["author_id"] },
      { fields: ["status"] },
      { fields: ["created_at"] },
      { fields: ["status", "created_at"] },
    ],
  }
);

export default PostHeader;
