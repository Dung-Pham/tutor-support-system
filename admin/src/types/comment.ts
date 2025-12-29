export interface CommentUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
}

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  content: string;
  likeCount: number;
  isEdited: boolean;
  status: "active" | "deleted";
  mentionedUserId?: string;
  mentionedUser?: CommentUser;
  user: CommentUser;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  status: "active" | "deleted";
  user: CommentUser;
  replies?: Reply[];
  createdAt: string;
  updatedAt: string;
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

export interface RepliesResponse {
  success: boolean;
  message: string;
  data: Reply[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
