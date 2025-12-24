export interface Post {
  id: string;
  title: string;
  slug: string;
  contentJson: Record<string, unknown>;
  contentPlain: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
  };
  status: "draft" | "pending" | "approved" | "rejected" | "deleted";
  rejectionReason?: string;
  approvedBy?: {
    id: string;
    displayName: string;
  };
  approvedAt?: string;
  rejectedBy?: {
    id: string;
    displayName: string;
  };
  rejectedAt?: string;
  deletedByUser?: {
    id: string;
    displayName: string;
  };
  deletedAt?: string;
  deleteReason?: string;
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
