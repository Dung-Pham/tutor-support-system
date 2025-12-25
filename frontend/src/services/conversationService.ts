import { apiClient } from './api';
import type { CreateConversationRequest, Conversation } from '@/types';

interface ConversationsResponse {
  success: boolean;
  message: string;
  data: Conversation[];
}

interface ConversationResponse {
  success: boolean;
  message: string;
  data: Conversation;
}

export async function getConversations(page = 1, limit = 20): Promise<Conversation[]> {
  const response = await apiClient.get<ConversationsResponse>(`/conversations`, {
    params: { page, limit },
  });
  return response.data.data;
}

export async function getConversation(conversationId: string): Promise<Conversation> {
  const response = await apiClient.get<ConversationResponse>(`/conversations/${conversationId}`);
  return response.data.data;
}

export async function createConversation(
  payload: CreateConversationRequest
): Promise<Conversation> {
  const response = await apiClient.post<ConversationResponse>(`/conversations`, payload);
  return response.data.data;
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
