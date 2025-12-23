export interface Post {
  _id: string;
  title: string;
  slug: string;
  contentJson: Record<string, unknown>;
  contentPlain: string;
  author: {
    _id: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
  };
  status: "draft" | "pending" | "approved" | "rejected";
  rejectionReason?: string;
  approvedBy?: {
    _id: string;
    displayName: string;
  };
  approvedAt?: string;
  rejectedBy?: {
    _id: string;
    displayName: string;
  };
  rejectedAt?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  success: boolean;
  message: string;
  data: Post[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  timestamp: string;
}
