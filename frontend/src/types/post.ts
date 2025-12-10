/**
 * File: types/post.ts
 * Mục đích: TypeScript types cho Post/Blog feature
 */

import { UserInfo } from './user';

export type PostStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Post {
  _id: string;
  title: string;
  content: string; // ← HTML string from TipTap
  author: UserInfo;
  status: PostStatus;
  imageUrls?: string[];
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDetail extends Post {
  // Extended info if needed
}

export interface CreatePostRequest {
  title: string;
  content: string;
  status?: 'draft' | 'pending';
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface PostsResponse {
  data: Post[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PostResponse {
  data: Post;
}
