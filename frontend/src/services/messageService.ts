/**
 * File: services/messageService.ts
 * Mục đích: API calls cho Message management
 */

import { apiClient } from './api';
import type { SendMessageRequest } from '@/types';

/**
 * Lấy messages của một conversation
 */
export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 50,
  sortBy: 'newest' | 'oldest' = 'newest'
) {
  const response = await apiClient.get(`/messages`, {
    params: { conversationId, page, limit, sortBy },
  });
  return response.data;
}

/**
 * Gửi message mới
 */
export async function sendMessage(payload: SendMessageRequest) {
  const response = await apiClient.post(`/messages`, payload);
  return response.data;
}

/**
 * Mark message as seen
 */
export async function markMessageAsSeen(messageId: string) {
  const response = await apiClient.patch(`/messages/${messageId}/seen`);
  return response.data;
}

/**
 * Xóa message
 */
export async function deleteMessage(messageId: string) {
  const response = await apiClient.delete(`/messages/${messageId}`);
  return response.data;
}

/**
 * Edit message
 */
export async function editMessage(messageId: string, content: string) {
  const response = await apiClient.patch(`/messages/${messageId}`, { content });
  return response.data;
}

export default {
  getMessages,
  sendMessage,
  markMessageAsSeen,
  deleteMessage,
  editMessage,
};
