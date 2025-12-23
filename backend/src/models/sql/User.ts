/**
 * File: models/sql/User.ts
 * Mục đích: Sequelize model cho Users table
 */

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export type UserRole = "student" | "tutor" | "admin";

export interface UserAttributes {
  id: string;
  email: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string | null;
  avatarId?: string | null;
  bio?: string | null;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | "id"
    | "avatarUrl"
    | "avatarId"
    | "bio"
    | "phone"
    | "role"
    | "isActive"
    | "lastSeenAt"
    | "createdAt"
    | "updatedAt"
  > {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: string;
  declare email: string;
  declare hashedPassword: string;
  declare firstName: string;
  declare lastName: string;
  declare displayName: string;
  declare avatarUrl: string | null;
  declare avatarId: string | null;
  declare bio: string | null;
  declare phone: string | null;
  declare role: UserRole;
  declare isActive: boolean;
  declare lastSeenAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    hashedPassword: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "hashed_password",
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "last_name",
    },
    displayName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: "display_name",
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "avatar_url",
    },
    avatarId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "avatar_id",
    },
    bio: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "student",
      validate: {
        isIn: [["student", "tutor", "admin"]],
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
    lastSeenAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "last_seen_at",
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
    tableName: "Users",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["email"] },
      { fields: ["role"] },
      { fields: ["last_seen_at"] },
      { fields: ["created_at"] },
    ],
  }
);

export default User;
