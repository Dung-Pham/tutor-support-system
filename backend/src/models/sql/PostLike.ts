// PostLike Model - SQL Server

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export interface PostLikeAttributes {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export interface PostLikeCreationAttributes
  extends Optional<PostLikeAttributes, "id" | "createdAt"> {}

class PostLike
  extends Model<PostLikeAttributes, PostLikeCreationAttributes>
  implements PostLikeAttributes
{
  declare id: string;
  declare postId: string;
  declare userId: string;
  declare createdAt: Date;
}

PostLike.init(
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
    tableName: "PostLikes",
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ["post_id"] },
      { fields: ["user_id"] },
      { unique: true, fields: ["post_id", "user_id"] },
    ],
  }
);

export default PostLike;
