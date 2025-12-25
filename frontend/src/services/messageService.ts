import { apiClient } from './api';
import type { SendMessageRequest, Message } from '@/types';

interface MessagesResponse {
  success: boolean;
  data: Message[];
  nextCursor: string | null;
}

interface MessageResponse {
  success: boolean;
  data: Message;
}

export async function getMessages(
  conversationId: string,
  cursor?: string,
  limit = 50
): Promise<{ messages: Message[]; nextCursor: string | null }> {
  const response = await apiClient.get<MessagesResponse>(
    `/conversations/${conversationId}/messages`,
    {
      params: { cursor, limit },
    }
  );
  return { messages: response.data.data, nextCursor: response.data.nextCursor };
}

export async function sendMessage(payload: SendMessageRequest): Promise<Message> {
  const response = await apiClient.post<MessageResponse>(`/messages/direct`, payload);
  return response.data.data;
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
