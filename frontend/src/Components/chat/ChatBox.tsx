/**
 * File: components/chat/ChatBox.tsx
 * Mục đích: Chat area chính
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { Conversation } from '@/types';
import { setMessages } from '@/store/slices/messagesSlice';
import * as messageService from '@/services/messageService';
import { ChatHeader } from './ChatHeader';
import { MessagesList } from './MessagesList';
import { MessageInput } from './MessageInput';

interface ChatBoxProps {
  conversation: Conversation;
}

export function ChatBox({ conversation }: ChatBoxProps) {
  const dispatch = useDispatch();
  const messages = useSelector(
    (state: RootState) => state.messages.messages[conversation._id] || []
  );
  const [loading, setLoading] = useState(false);

  // Fetch messages when conversation changes
  useEffect(() => {
    fetchMessages();
  }, [conversation._id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getMessages(conversation._id);
      dispatch(setMessages({ conversationId: conversation._id, messages: response.data || [] }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ChatHeader conversation={conversation} />

      {/* Messages */}
      <MessagesList messages={messages} loading={loading} />

      {/* Input */}
      <MessageInput conversationId={conversation._id} />
    </div>
  );
}
