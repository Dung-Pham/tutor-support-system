/**
 * File: types/common.ts
 * Mục đích: Common types dùng chung
 */

import { Request } from "express";

// ==========================================
// API RESPONSE TYPES
// ==========================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==========================================
// REQUEST TYPES
// ==========================================
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    phone?: string;
    role: "student" | "tutor" | "admin";
    isActive: boolean;
    lastSeenAt?: Date;
    createdAt: Date;
  };
}
