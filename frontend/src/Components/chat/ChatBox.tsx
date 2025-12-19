import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { Conversation } from '@/types';
import { setMessages } from '@/store/slices/messagesSlice';
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
  const messages = useSelector((state: RootState) => {
    const msgs = state.messages.messages[conversation._id] || [];
    // Sort messages by createdAt
    return msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });
  const [loading, setLoading] = useState(false);

  // Join conversation room on mount, leave on unmount
  useEffect(() => {
    socketService.joinConversation(conversation._id);
    return () => {
      socketService.leaveConversation(conversation._id);
    };
  }, [conversation._id]);

  // Setup socket listeners for real-time messages
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      if (data.conversationId === conversation._id) {
        dispatch(addMessage(data.message));
      }
    };

    const handleMessageSeen = (data: any) => {
      if (data.conversationId === conversation._id) {
        // Update message seen status if needed
        console.log('Message seen:', data);
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.conversationId === conversation._id) {
        // Handle typing indicator if needed
        console.log('User typing:', data);
      }
    };

    // Add listeners
    socketService.socket?.on('new_message', handleNewMessage);
    socketService.socket?.on('message_seen', handleMessageSeen);
    socketService.socket?.on('user_typing', handleUserTyping);

    return () => {
      // Remove listeners
      socketService.socket?.off('new_message', handleNewMessage);
      socketService.socket?.off('message_seen', handleMessageSeen);
      socketService.socket?.off('user_typing', handleUserTyping);
    };
  }, [conversation._id, dispatch]);

  // Fetch messages when conversation changes
  useEffect(() => {
    fetchMessages();
  }, [conversation._id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getMessages(conversation._id);
      dispatch(
        setMessages({ conversationId: conversation._id, messages: response.data.messages || [] })
      );
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
      <TypingIndicator conversationId={conversation._id} />

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 border-t w-full">
        <MessageInput conversation={conversation} />
      </div>
    </div>
  );
}
