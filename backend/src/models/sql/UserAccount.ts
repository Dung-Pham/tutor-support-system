// UserAccount Model - SQL Server (Compatible with existing schema)

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export type UserRole = "student" | "tutor" | "admin";

export interface UserAccountAttributes {
  userId: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string | null;
  role: string;
  status: boolean;
  isVerified?: boolean | null;
  dateOfBirth?: Date | null;
  locationDetail?: string | null;
  addressId?: string | null;
  gender?: boolean | null;
  avatarUrl?: string | null;
  avatarId?: string | null;
  bio?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  // Virtual fields for compatibility
  id?: string;
  hashedPassword?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UserAccountCreationAttributes
  extends Optional<
    UserAccountAttributes,
    | "userId"
    | "phone"
    | "status"
    | "isVerified"
    | "dateOfBirth"
    | "locationDetail"
    | "addressId"
    | "gender"
    | "avatarUrl"
    | "avatarId"
    | "bio"
    | "createdAt"
    | "updatedAt"
    | "id"
    | "hashedPassword"
    | "displayName"
    | "firstName"
    | "lastName"
    | "isActive"
  > {}

class UserAccount
  extends Model<UserAccountAttributes, UserAccountCreationAttributes>
  implements UserAccountAttributes
{
  declare userId: string;
  declare email: string;
  declare passwordHash: string;
  declare name: string;
  declare phone: string | null;
  declare role: string;
  declare status: boolean;
  declare isVerified: boolean | null;
  declare dateOfBirth: Date | null;
  declare locationDetail: string | null;
  declare addressId: string | null;
  declare gender: boolean | null;
  declare avatarUrl: string | null;
  declare avatarId: string | null;
  declare bio: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  // Virtual fields
  declare id: string;
  declare displayName: string;
  declare hashedPassword: string;
  declare firstName: string;
  declare lastName: string;
  declare isActive: boolean;
}

UserAccount.init(
  {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "user_id",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "password_hash",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "student",
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: "is_verified",
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "dateOfBirth",
    },
    locationDetail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "locationDetail",
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "address_id",
    },
    gender: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
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
    // Virtual fields for compatibility with old code that uses different column names
    id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue("userId");
      },
    },
    displayName: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue("name");
      },
    },
    hashedPassword: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue("passwordHash");
      },
    },
    firstName: {
      type: DataTypes.VIRTUAL,
      get() {
        const name = this.getDataValue("name") || "";
        const parts = name.split(" ");
        return parts[0] || name;
      },
    },
    lastName: {
      type: DataTypes.VIRTUAL,
      get() {
        const name = this.getDataValue("name") || "";
        const parts = name.split(" ");
        return parts.slice(1).join(" ") || "";
      },
    },
    isActive: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue("status");
      },
    },
  },
  {
    sequelize,
    tableName: "UserAccount",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["email"], unique: true },
      { fields: ["role"] },
    ],
  }
);

export default UserAccount;
