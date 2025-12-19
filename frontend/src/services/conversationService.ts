import { apiClient } from './api';
import type { CreateConversationRequest } from '@/types';

export async function getConversations(page = 1, limit = 20) {
  const response = await apiClient.get(`/conversations`, {
    params: { page, limit },
  });
  return response;
}

export async function getConversation(conversationId: string) {
  const response = await apiClient.get(`/conversations/${conversationId}`);
  return response;
}

export async function createConversation(payload: CreateConversationRequest) {
  const response = await apiClient.post(`/conversations`, payload);
  return response;
}

export async function markConversationAsSeen(conversationId: string) {
  const response = await apiClient.post(`/conversations/${conversationId}/mark-seen`);
  return response.data;
}

export default {
  getConversations,
  getConversation,
  createConversation,
  markConversationAsSeen,
};
