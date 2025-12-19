import type { UserInfo } from './user';

export interface Friend {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface FriendWithUser extends Friend {
  friend?: UserInfo;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface FriendRequest {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface FriendRequestDetail extends FriendRequest {
  fromUser?: UserInfo;
  toUser?: UserInfo;
}

export interface SendFriendRequestPayload {
  to: string;
  message?: string;
}

export interface HandleFriendRequestPayload {
  requestId: string;
  action: 'accept' | 'decline';
}

export interface FriendListResponse {
  friends: FriendWithUser[];
  total: number;
  page: number;
  limit: number;
}

export interface FriendRequestListResponse {
  requests: FriendRequestDetail[];
  total: number;
  page: number;
  limit: number;
}
