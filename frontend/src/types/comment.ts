import { UserInfo } from './user';

// ==================== COMMENT ====================

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: UserInfo;
  content: string;
  status: 'active' | 'deleted';
  replyCount: number;
  likeCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentsResponse {
  success: boolean;
  message: string;
  data: Comment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: Comment;
}

// ==================== REPLY ====================

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  user?: UserInfo;
  mentionedUserId?: string | null;
  mentionedUser?: UserInfo | null;
  content: string;
  status: 'active' | 'deleted';
  likeCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReplyRequest {
  content: string;
  mentionedUserId?: string;
}

export interface RepliesResponse {
  success: boolean;
  message: string;
  data: Reply[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReplyResponse {
  success: boolean;
  message: string;
  data: Reply;
}

// ==================== LIKE ====================

export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    liked: boolean;
    likeCount: number;
  };
}

export interface LikeStatusResponse {
  success: boolean;
  data: {
    liked: boolean;
  };
}

export interface PostLike {
  _id: string;
  postId: string;
  userId: UserInfo;
  createdAt: string;
}

export interface PostLikesResponse {
  success: boolean;
  message: string;
  data: PostLike[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
