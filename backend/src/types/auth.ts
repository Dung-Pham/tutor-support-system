// Auth Types

import { Document, Types } from "mongoose";
import { IUserResponse, UserRole } from "./user.js";

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: IUserResponse;
  accessToken?: string;
}
