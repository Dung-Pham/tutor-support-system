import { useCallback } from 'react';
import socketService from '@/services/socketService';

export function useSocket() {
  const joinConversation = useCallback((conversationId: string) => {
    socketService.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketService.leaveConversation(conversationId);
  }, []);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    socketService.sendTyping(conversationId, isTyping);
  }, []);

  const sendMessageSeen = useCallback((conversationId: string, messageId: string) => {
    socketService.sendMessageSeen(conversationId, messageId);
  }, []);

  return {
    isConnected: () => socketService.isConnected(),
    joinConversation,
    leaveConversation,
    sendTyping,
    sendMessageSeen,
  };
}

export default useSocket;
