import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, CreatePostRequest, UpdatePostRequest, PostStatus } from '@/types/post';
import * as postService from '@/services/postService';
import * as likeService from '@/services/likeService';

export interface PostState {
  posts: Post[];
  myPosts: Post[];
  pendingPosts: Post[];
  currentPost: Post | null;
  selectedPost: Post | null;
  showDetailModal: boolean;
  currentStatus: PostStatus | 'all';
  currentPage: number;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  // Like state
  likedPosts: Record<string, boolean>;
}

const initialState: PostState = {
  posts: [],
  myPosts: [],
  pendingPosts: [],
  currentPost: null,
  selectedPost: null,
  showDetailModal: false,
  currentStatus: 'draft',
  currentPage: 1,
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  likedPosts: {},
};

// Async Thunks
export const getApprovedPostsAsync = createAsyncThunk(
  'posts/getApprovedPosts',
  async (params?: { page?: number; limit?: number }) => {
    return await postService.getApprovedPosts(params?.page || 1, params?.limit || 10);
  }
);

export const getPendingPostsAsync = createAsyncThunk(
  'posts/getPendingPosts',
  async (params?: { page?: number; limit?: number }) => {
    return await postService.getPendingPosts(params?.page || 1, params?.limit || 10);
  }
);

export const getMyPostsAsync = createAsyncThunk(
  'posts/getMyPosts',
  async ({
    status,
    page = 1,
    limit = 10,
  }: { status?: PostStatus; page?: number; limit?: number } = {}) => {
    return await postService.getMyPosts(status, page, limit);
  }
);

export const createPostAsync = createAsyncThunk(
  'posts/createPost',
  async (data: CreatePostRequest) => {
    return await postService.createPost(data);
  }
);

export const updatePostAsync = createAsyncThunk(
  'posts/updatePost',
  async ({ id, data }: { id: string; data: UpdatePostRequest }) => {
    return await postService.updatePost(id, data);
  }
);

export const deletePostAsync = createAsyncThunk('posts/deletePost', async (id: string) => {
  await postService.deletePost(id);
  return id;
});

// Hard delete - dành cho tutor xóa bài draft/pending của mình
export const hardDeletePostAsync = createAsyncThunk('posts/hardDeletePost', async (id: string) => {
  await postService.hardDeletePost(id);
  return id;
});

export const approvePostAsync = createAsyncThunk('posts/approvePost', async (id: string) => {
  return await postService.approvePost(id);
});

export const rejectPostAsync = createAsyncThunk(
  'posts/rejectPost',
  async ({ id, reason }: { id: string; reason: string }) => {
    return await postService.rejectPost(id, reason);
  }
);

// Get post detail (với contentJson từ MongoDB)
export const getPostDetailAsync = createAsyncThunk('posts/getPostDetail', async (id: string) => {
  return await postService.getPostDetail(id);
});

// Like/Unlike post
export const togglePostLikeAsync = createAsyncThunk(
  'posts/togglePostLike',
  async (postId: string) => {
    const response = await likeService.togglePostLike(postId);
    return { postId, liked: response.data.liked, likeCount: response.data.likeCount };
  }
);

// Check if user liked post
export const checkPostLikeAsync = createAsyncThunk(
  'posts/checkPostLike',
  async (postId: string) => {
    const response = await likeService.checkPostLike(postId);
    return { postId, liked: response.data.liked };
  }
);

// Slice
const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    setMyPosts: (state, action: PayloadAction<Post[]>) => {
      state.myPosts = action.payload;
    },
    setPendingPosts: (state, action: PayloadAction<Post[]>) => {
      state.pendingPosts = action.payload;
    },
    setCurrentPost: (state, action: PayloadAction<Post | null>) => {
      state.currentPost = action.payload;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
      state.myPosts = state.myPosts.filter((p) => p.id !== action.payload);
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedPost: (state, action: PayloadAction<Post | null>) => {
      state.selectedPost = action.payload;
    },
    setShowDetailModal: (state, action: PayloadAction<boolean>) => {
      state.showDetailModal = action.payload;
    },
    setCurrentStatus: (state, action: PayloadAction<PostStatus | 'all'>) => {
      state.currentStatus = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Approved Posts
    builder
      .addCase(getApprovedPostsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApprovedPostsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.data;
        state.page = action.payload.page;
        state.total = action.payload.total;
      })
      .addCase(getApprovedPostsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy danh sách bài viết';
      });

    // Get My Posts
    builder
      .addCase(getMyPostsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyPostsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.myPosts = action.payload.data;
        state.page = action.payload.page;
        state.total = action.payload.total;
      })
      .addCase(getMyPostsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy bài viết của bạn';
      });

    // Get Pending Posts
    builder
      .addCase(getPendingPostsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingPostsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingPosts = action.payload.data;
      })
      .addCase(getPendingPostsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy bài viết chờ duyệt';
      });

    // Create Post
    builder
      .addCase(createPostAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPostAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 'draft') {
          state.myPosts.unshift(action.payload);
        } else {
          state.pendingPosts.unshift(action.payload);
        }
      })
      .addCase(createPostAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi tạo bài viết';
      });

    // Update Post
    builder
      .addCase(updatePostAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePostAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update trong tất cả lists
        const postsIndex = state.posts.findIndex((p) => p.id === action.payload.id);
        if (postsIndex !== -1) {
          state.posts[postsIndex] = action.payload;
        }
        const myPostsIndex = state.myPosts.findIndex((p) => p.id === action.payload.id);
        if (myPostsIndex !== -1) {
          state.myPosts[myPostsIndex] = action.payload;
        }
        const pendingIndex = state.pendingPosts.findIndex((p) => p.id === action.payload.id);
        if (pendingIndex !== -1) {
          state.pendingPosts[pendingIndex] = action.payload;
        }
        // Update currentPost và selectedPost nếu chúng là post này
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
        if (state.selectedPost?.id === action.payload.id) {
          state.selectedPost = action.payload;
        }
      })
      .addCase(updatePostAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi cập nhật bài viết';
      });

    // Delete Post
    builder
      .addCase(deletePostAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Xoá từ tất cả lists
        state.posts = state.posts.filter((p) => p.id !== action.payload);
        state.myPosts = state.myPosts.filter((p) => p.id !== action.payload);
        state.pendingPosts = state.pendingPosts.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePostAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi xóa bài viết';
      });

    // Hard Delete Post (tutor xóa bài draft/pending)
    builder
      .addCase(hardDeletePostAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(hardDeletePostAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter((p) => p.id !== action.payload);
        state.myPosts = state.myPosts.filter((p) => p.id !== action.payload);
        state.pendingPosts = state.pendingPosts.filter((p) => p.id !== action.payload);
      })
      .addCase(hardDeletePostAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi xóa bài viết';
      });

    // Approve Post
    builder
      .addCase(approvePostAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approvePostAsync.fulfilled, (state, action) => {
        state.loading = false;
        const postIndex = state.pendingPosts.findIndex((p) => p.id === action.payload.id);
        if (postIndex !== -1) {
          state.pendingPosts.splice(postIndex, 1);
          state.posts.unshift(action.payload);
        }
      })
      .addCase(approvePostAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi duyệt bài viết';
      });

    // Reject Post
    builder
      .addCase(rejectPostAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectPostAsync.fulfilled, (state, action) => {
        state.loading = false;
        const postIndex = state.pendingPosts.findIndex((p) => p.id === action.payload.id);
        if (postIndex !== -1) {
          state.pendingPosts[postIndex] = action.payload;
        }
      })
      .addCase(rejectPostAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi từ chối bài viết';
      });

    // Get Post Detail (với contentJson)
    builder
      .addCase(getPostDetailAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPostDetailAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPost = action.payload;
        state.showDetailModal = true;
      })
      .addCase(getPostDetailAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy chi tiết bài viết';
      });

    // Toggle Post Like
    builder.addCase(togglePostLikeAsync.fulfilled, (state, action) => {
      const { postId, liked, likeCount } = action.payload;
      state.likedPosts[postId] = liked;

      // Update likeCount on post from server response
      const updateLikeCount = (posts: Post[]) => {
        const post = posts.find((p) => p.id === postId);
        if (post) {
          post.likeCount = likeCount;
        }
      };

      updateLikeCount(state.posts);
      updateLikeCount(state.myPosts);
      updateLikeCount(state.pendingPosts);

      if (state.currentPost?.id === postId) {
        state.currentPost.likeCount = likeCount;
      }
      if (state.selectedPost?.id === postId) {
        state.selectedPost.likeCount = likeCount;
      }
    });

    // Check Post Like
    builder.addCase(checkPostLikeAsync.fulfilled, (state, action) => {
      const { postId, liked } = action.payload;
      state.likedPosts[postId] = liked;
    });
  },
});

export const {
  setPosts,
  setMyPosts,
  setPendingPosts,
  setCurrentPost,
  addPost,
  deletePost,
  setPage,
  setError,
  setSelectedPost,
  setShowDetailModal,
  setCurrentStatus,
  setCurrentPage,
} = postSlice.actions;

export default postSlice.reducer;
