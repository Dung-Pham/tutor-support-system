import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: { firstName: string; lastName: string };
  images: string[];
  createdAt: string;
  tags: string[];
}

interface PostState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

// Async thunks
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await axios.get('/api/posts');
  return response.data;
});

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: Omit<Post, '_id' | 'author' | 'createdAt'>) => {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/posts', postData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, postData }: { id: string; postData: Partial<Post> }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`/api/posts/${id}`, postData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const deletePost = createAsyncThunk('posts/deletePost', async (id: string) => {
  const token = localStorage.getItem('token');
  await axios.delete(`/api/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return id;
});

// Slice
const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
  } as PostState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((post) => post._id === action.payload._id);
        if (index !== -1) state.posts[index] = action.payload;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post._id !== action.payload);
      });
  },
});

export default postSlice.reducer;
