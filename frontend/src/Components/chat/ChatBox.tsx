import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { Conversation } from '@/types';
import { setMessages, addMessage } from '@/store/slices/messagesSlice';
import * as messageService from '@/services/messageService';
import { MessagesList } from './MessagesList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import socketService from '@/services/socketService';

interface ChatBoxProps {
  conversation: Conversation;
}

export function ChatBox({ conversation }: ChatBoxProps) {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const rawMessages = useSelector((state: RootState) => state.messages.messages[conversation.id]);

  // Memoize sorted messages để tránh re-render không cần thiết
  const messages = useMemo(() => {
    const msgs = rawMessages || [];
    return [...msgs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [rawMessages]);

  const [loading, setLoading] = useState(false);

  // Join conversation room on mount, leave on unmount
  useEffect(() => {
    socketService.joinConversation(conversation.id);
    return () => {
      socketService.leaveConversation(conversation.id);
    };
  }, [conversation.id]);

  // Setup socket listeners for real-time messages
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      // Chỉ add message từ NGƯỜI KHÁC (message của mình đã add từ API response)
      if (data.conversationId === conversation.id && data.message.senderId !== currentUserId) {
        dispatch(addMessage(data.message));
      }
    };

    const handleMessageSeen = (data: any) => {
      if (data.conversationId === conversation.id) {
        // Update message seen status if needed
        console.log('Message seen:', data);
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.conversationId === conversation.id) {
        // Handle typing indicator if needed
        console.log('User typing:', data);
      }
    };

    // Add listeners using socketService.on()
    const unsubNewMessage = socketService.on('new_message', handleNewMessage);
    const unsubMessageSeen = socketService.on('message_seen', handleMessageSeen);
    const unsubUserTyping = socketService.on('user_typing', handleUserTyping);

    return () => {
      // Remove listeners
      unsubNewMessage();
      unsubMessageSeen();
      unsubUserTyping();
    };
  }, [conversation.id, currentUserId, dispatch]);

  // Fetch messages when conversation changes
  useEffect(() => {
    fetchMessages();
  }, [conversation.id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { messages } = await messageService.getMessages(conversation.id);
      dispatch(setMessages({ conversationId: conversation.id, messages }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Messages - Scrollable area - chiếm toàn bộ không gian */}
      <div className="flex-1 overflow-hidden w-full">
        <MessagesList messages={messages} loading={loading} />
      </div>

      {/* Typing Indicator */}
      <TypingIndicator conversationId={conversation.id} />

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 border-t w-full">
        <MessageInput conversation={conversation} />
      </div>
    </div>
  );
}
