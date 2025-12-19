import { UserInfo } from './user';

export type PostStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Post {
  _id: string;
  title: string;
  slug?: string;
  contentJson: any; // Tiptap JSON document (ProseMirror format)
  contentPlain?: string; // Plain text for preview/search
  author: UserInfo;
  status: PostStatus;
  rejectionReason?: string;
  approvedBy?: UserInfo;
  approvedAt?: Date;
  rejectedBy?: UserInfo;
  rejectedAt?: Date;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDetail extends Post {}

export interface CreatePostRequest {
  title: string;
  contentJson: any; // Tiptap JSON document
  status?: 'draft' | 'pending';
}

export interface UpdatePostRequest {
  title?: string;
  contentJson?: any; // Tiptap JSON document
  status?: 'draft' | 'pending';
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
