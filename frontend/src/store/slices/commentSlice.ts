import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Comment, Reply } from '@/types/comment';
import * as commentService from '@/services/commentService';

export interface CommentState {
  // Comments by postId
  commentsByPost: Record<string, Comment[]>;
  // Replies by commentId
  repliesByComment: Record<string, Reply[]>;
  // Loading states
  loadingComments: boolean;
  loadingReplies: Record<string, boolean>;
  // Error
  error: string | null;
  // Pagination
  commentsPage: number;
  commentsTotal: number;
  commentsTotalPages: number;
  // Liked status cache
  likedComments: Record<string, boolean>;
  likedReplies: Record<string, boolean>;
}

const initialState: CommentState = {
  commentsByPost: {},
  repliesByComment: {},
  loadingComments: false,
  loadingReplies: {},
  error: null,
  commentsPage: 1,
  commentsTotal: 0,
  commentsTotalPages: 0,
  likedComments: {},
  likedReplies: {},
};

// ==================== ASYNC THUNKS ====================

// Lấy comments của bài viết
export const getCommentsAsync = createAsyncThunk(
  'comments/getComments',
  async ({ postId, page = 1, limit = 10 }: { postId: string; page?: number; limit?: number }) => {
    const response = await commentService.getComments(postId, page, limit);
    return { postId, ...response };
  }
);

// Tạo comment mới
export const createCommentAsync = createAsyncThunk(
  'comments/createComment',
  async ({ postId, content }: { postId: string; content: string }) => {
    const response = await commentService.createComment(postId, { content });
    return { postId, comment: response.data };
  }
);

// Cập nhật comment
export const updateCommentAsync = createAsyncThunk(
  'comments/updateComment',
  async ({
    commentId,
    postId,
    content,
  }: {
    commentId: string;
    postId: string;
    content: string;
  }) => {
    const response = await commentService.updateComment(commentId, { content });
    return { postId, comment: response.data };
  }
);

// Xóa comment
export const deleteCommentAsync = createAsyncThunk(
  'comments/deleteComment',
  async ({ commentId, postId }: { commentId: string; postId: string }) => {
    await commentService.deleteComment(commentId);
    return { commentId, postId };
  }
);

// Lấy replies của comment
export const getRepliesAsync = createAsyncThunk(
  'comments/getReplies',
  async ({
    commentId,
    page = 1,
    limit = 10,
  }: {
    commentId: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await commentService.getReplies(commentId, page, limit);
    return { commentId, ...response };
  }
);

// Tạo reply mới
export const createReplyAsync = createAsyncThunk(
  'comments/createReply',
  async ({
    commentId,
    postId,
    content,
  }: {
    commentId: string;
    postId: string;
    content: string;
  }) => {
    const response = await commentService.createReply(commentId, { content });
    return { commentId, postId, reply: response.data };
  }
);

// Xóa reply
export const deleteReplyAsync = createAsyncThunk(
  'comments/deleteReply',
  async ({ replyId, commentId }: { replyId: string; commentId: string }) => {
    await commentService.deleteReply(replyId);
    return { replyId, commentId };
  }
);

// Like/Unlike comment
export const toggleCommentLikeAsync = createAsyncThunk(
  'comments/toggleCommentLike',
  async ({ commentId, postId }: { commentId: string; postId: string }) => {
    const response = await commentService.toggleCommentLike(commentId);
    return { commentId, postId, liked: response.data.liked, likeCount: response.data.likeCount };
  }
);

// Like/Unlike reply
export const toggleReplyLikeAsync = createAsyncThunk(
  'comments/toggleReplyLike',
  async ({ replyId, commentId }: { replyId: string; commentId: string }) => {
    const response = await commentService.toggleReplyLike(replyId);
    return { replyId, commentId, liked: response.data.liked, likeCount: response.data.likeCount };
  }
);

// ==================== SLICE ====================

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state, action: PayloadAction<string>) => {
      delete state.commentsByPost[action.payload];
    },
    clearReplies: (state, action: PayloadAction<string>) => {
      delete state.repliesByComment[action.payload];
    },
    setLikedComment: (state, action: PayloadAction<{ commentId: string; liked: boolean }>) => {
      state.likedComments[action.payload.commentId] = action.payload.liked;
    },
    setLikedReply: (state, action: PayloadAction<{ replyId: string; liked: boolean }>) => {
      state.likedReplies[action.payload.replyId] = action.payload.liked;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Comments
    builder
      .addCase(getCommentsAsync.pending, (state) => {
        state.loadingComments = true;
        state.error = null;
      })
      .addCase(getCommentsAsync.fulfilled, (state, action) => {
        state.loadingComments = false;
        state.commentsByPost[action.payload.postId] = action.payload.data;
        state.commentsPage = action.payload.page;
        state.commentsTotal = action.payload.total;
        state.commentsTotalPages = action.payload.totalPages;
      })
      .addCase(getCommentsAsync.rejected, (state, action) => {
        state.loadingComments = false;
        state.error = action.error.message || 'Lỗi khi tải comments';
      });

    // Create Comment
    builder
      .addCase(createCommentAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(createCommentAsync.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = [];
        }
        state.commentsByPost[postId].unshift(comment);
        state.commentsTotal += 1;
      })
      .addCase(createCommentAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Lỗi khi tạo comment';
      });

    // Update Comment
    builder.addCase(updateCommentAsync.fulfilled, (state, action) => {
      const { postId, comment } = action.payload;
      const comments = state.commentsByPost[postId];
      if (comments) {
        const index = comments.findIndex((c) => c._id === comment._id);
        if (index !== -1) {
          comments[index] = comment;
        }
      }
    });

    // Delete Comment
    builder.addCase(deleteCommentAsync.fulfilled, (state, action) => {
      const { commentId, postId } = action.payload;
      const comments = state.commentsByPost[postId];
      if (comments) {
        state.commentsByPost[postId] = comments.filter((c) => c._id !== commentId);
        state.commentsTotal -= 1;
      }
      // Also clear replies
      delete state.repliesByComment[commentId];
    });

    // Get Replies
    builder
      .addCase(getRepliesAsync.pending, (state, action) => {
        state.loadingReplies[action.meta.arg.commentId] = true;
      })
      .addCase(getRepliesAsync.fulfilled, (state, action) => {
        const { commentId, data } = action.payload;
        state.loadingReplies[commentId] = false;
        state.repliesByComment[commentId] = data;
      })
      .addCase(getRepliesAsync.rejected, (state, action) => {
        state.loadingReplies[action.meta.arg.commentId] = false;
      });

    // Create Reply
    builder.addCase(createReplyAsync.fulfilled, (state, action) => {
      const { commentId, postId, reply } = action.payload;
      if (!state.repliesByComment[commentId]) {
        state.repliesByComment[commentId] = [];
      }
      state.repliesByComment[commentId].push(reply);

      // Update reply_count on parent comment
      const comments = state.commentsByPost[postId];
      if (comments) {
        const comment = comments.find((c) => c._id === commentId);
        if (comment) {
          comment.reply_count += 1;
        }
      }
    });

    // Delete Reply
    builder.addCase(deleteReplyAsync.fulfilled, (state, action) => {
      const { replyId, commentId } = action.payload;
      const replies = state.repliesByComment[commentId];
      if (replies) {
        state.repliesByComment[commentId] = replies.filter((r) => r._id !== replyId);
      }
    });

    // Toggle Comment Like
    builder.addCase(toggleCommentLikeAsync.fulfilled, (state, action) => {
      const { commentId, postId, liked, likeCount } = action.payload;
      state.likedComments[commentId] = liked;

      // Update like_count on comment from server response
      const comments = state.commentsByPost[postId];
      if (comments) {
        const comment = comments.find((c) => c._id === commentId);
        if (comment) {
          comment.like_count = likeCount;
        }
      }
    });

    // Toggle Reply Like
    builder.addCase(toggleReplyLikeAsync.fulfilled, (state, action) => {
      const { replyId, commentId, liked, likeCount } = action.payload;
      state.likedReplies[replyId] = liked;

      // Update like_count on reply from server response
      const replies = state.repliesByComment[commentId];
      if (replies) {
        const reply = replies.find((r) => r._id === replyId);
        if (reply) {
          reply.like_count = likeCount;
        }
      }
    });
  },
});

export const { clearComments, clearReplies, setLikedComment, setLikedReply, clearError } =
  commentSlice.actions;

export default commentSlice.reducer;
