import { apiClient } from './api';
import type { SendMessageRequest } from '@/types';

export async function getMessages(conversationId: string, cursor?: string, limit = 50) {
  const response = await apiClient.get(`/conversations/${conversationId}/messages`, {
    params: { cursor, limit },
  });
  return response;
}

export async function sendMessage(payload: SendMessageRequest) {
  const response = await apiClient.post(`/messages/direct`, payload);
  return response;
}

export async function markMessageAsSeen(messageId: string) {
  const response = await apiClient.patch(`/messages/${messageId}/seen`);
  return response.data;
}

export async function deleteMessage(messageId: string) {
  const response = await apiClient.delete(`/messages/${messageId}`);
  return response.data;
}

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
