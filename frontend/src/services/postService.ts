import axios from 'axios';

const API_BASE_URL = '/api/posts';

export const postService = {
  // Lấy tất cả posts
  getPosts: async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  // Tạo post mới
  createPost: async (postData: {
    title: string;
    content: string;
    images: string[];
    tags: string[];
  }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_BASE_URL, postData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Lấy post theo ID
  getPostById: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Cập nhật post
  updatePost: async (
    id: string,
    postData: Partial<{ title: string; content: string; images: string[]; tags: string[] }>
  ) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/${id}`, postData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Xóa post
  deletePost: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Upload ảnh
  uploadImage: async (file: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
