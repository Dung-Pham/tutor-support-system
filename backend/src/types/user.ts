/**
 * File: types/user.ts
 * Mục đích: User-related types
 */

import { Document, Types } from "mongoose";

// ==========================================
// USER TYPES
// ==========================================
export type UserRole = "student" | "tutor" | "admin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  avatarId?: string;
  bio?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isOnline?: boolean;
}

export interface IUserResponse {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  lastSeenAt: Date;
  createdAt: Date;
  isOnline?: boolean;
}

export interface UserPayload {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  lastSeenAt?: Date;
  createdAt: Date;
}
