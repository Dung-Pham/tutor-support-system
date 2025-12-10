/**
 * File: types/friend.ts
 * Mục đích: Định nghĩa tất cả types liên quan đến Friend & Friend Request
 */

import type { UserInfo } from './user';

/**
 * Thông tin cơ bản của Friend
 */
export interface Friend {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

/**
 * Friend với thông tin chi tiết
 */
export interface FriendWithUser extends Friend {
  friend?: UserInfo; // Thông tin user kia (userA nếu current user là userB, ngược lại)
}

/**
 * Friend Request Status
 */
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

/**
 * Thông tin Friend Request
 */
export interface FriendRequest {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

/**
 * Friend Request chi tiết - hiển thị khi list requests
 */
export interface FriendRequestDetail extends FriendRequest {
  fromUser?: UserInfo;
  toUser?: UserInfo;
}

/**
 * Send Friend Request Payload
 */
export interface SendFriendRequestPayload {
  to: string;
  message?: string;
}

/**
 * Accept/Decline Friend Request Payload
 */
export interface HandleFriendRequestPayload {
  requestId: string;
  action: 'accept' | 'decline';
}

/**
 * Friend List Response
 */
export interface FriendListResponse {
  friends: FriendWithUser[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Friend Request List Response
 */
export interface FriendRequestListResponse {
  requests: FriendRequestDetail[];
  total: number;
  page: number;
  limit: number;
}
