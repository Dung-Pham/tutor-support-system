// Session Model - SQL Server

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/sqlserver.js";

export interface SessionAttributes {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionCreationAttributes
  extends Optional<SessionAttributes, "id" | "createdAt"> {}

class Session
  extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes
{
  declare id: string;
  declare userId: string;
  declare refreshToken: string;
  declare expiresAt: Date;
  declare createdAt: Date;
}

Session.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: "UserAccount",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    refreshToken: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      field: "refresh_token",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
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
    tableName: "Sessions",
    timestamps: false,
    underscored: true,
    indexes: [{ fields: ["user_id"] }, { fields: ["expires_at"] }],
  }
);

export default Session;
