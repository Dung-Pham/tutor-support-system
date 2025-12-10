/**
 * File: services/conversationService.ts
 * Mục đích: API calls cho Conversation management
 */

import { apiClient } from './api';
import type { CreateConversationRequest } from '@/types';

/**
 * Lấy danh sách conversations của user
 */
export async function getConversations(page = 1, limit = 20) {
  const response = await apiClient.get(`/conversations`, {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Lấy chi tiết một conversation
 */
export async function getConversation(conversationId: string) {
  const response = await apiClient.get(`/conversations/${conversationId}`);
  return response.data;
}

/**
 * Tạo conversation mới (direct hoặc group)
 */
export async function createConversation(payload: CreateConversationRequest) {
  const response = await apiClient.post(`/conversations`, payload);
  return response.data;
}

/**
 * Cập nhật conversation (e.g., rename group)
 */
export async function updateConversation(conversationId: string, data: any) {
  const response = await apiClient.put(`/conversations/${conversationId}`, data);
  return response.data;
}

/**
 * Mark conversation as seen
 */
export async function markConversationAsSeen(conversationId: string) {
  const response = await apiClient.post(`/conversations/${conversationId}/mark-seen`);
  return response.data;
}

export default {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  markConversationAsSeen,
};
