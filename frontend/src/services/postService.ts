import { apiClient } from './api';
import { CreatePostRequest, UpdatePostRequest, PostStatus } from '@/types/post';

export async function getApprovedPosts(page: number = 1, limit: number = 10) {
  const response = await apiClient.get('/posts', {
    params: { page, limit, status: 'approved' },
  });
  return response.data;
}

export async function getPendingPosts(page: number = 1, limit: number = 10) {
  const response = await apiClient.get('/posts/pending', {
    params: { page, limit },
  });
  return response.data;
}

export async function getPostDetail(id: string) {
  const response = await apiClient.get(`/posts/${id}`);
  return response.data?.data || response.data;
}

export async function createPost(data: CreatePostRequest) {
  const response = await apiClient.post('/posts', data);
  return response.data;
}

export async function updatePost(id: string, data: UpdatePostRequest) {
  const response = await apiClient.patch(`/posts/${id}`, data);
  return response.data;
}

export async function deletePost(id: string) {
  const response = await apiClient.delete(`/posts/${id}`);
  return response.data;
}

// Hard delete - dành cho tutor xóa bài draft/pending của mình
export async function hardDeletePost(id: string) {
  const response = await apiClient.delete(`/posts/${id}/permanent`);
  return response.data;
}

export async function approvePost(id: string) {
  const response = await apiClient.patch(`/posts/${id}/approve`);
  return response.data;
}

export async function rejectPost(id: string, reason: string) {
  const response = await apiClient.patch(`/posts/${id}/reject`, { reason });
  return response.data;
}

export async function getMyPosts(status?: PostStatus, page: number = 1, limit: number = 10) {
  const response = await apiClient.get('/posts/my', {
    params: { status, page, limit },
  });
  return response.data;
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('images', file);

  const response = await apiClient.post('/upload/images?type=post', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
