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
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?.user_id || currentUser?.id;
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

  // Tìm người đang chat (không phải current user)
  const otherParticipant = conversation.participants.find(
    (p) => p.id?.toUpperCase() !== currentUserId?.toUpperCase()
  );
  const chatPartnerName = otherParticipant?.name || 'Người dùng';
  const chatPartnerAvatar = otherParticipant?.avatarUrl;
  const chatPartnerInitial = chatPartnerName.charAt(0).toUpperCase();

  // Real-time online status từ Redux (socket)
  const onlineUsers = useSelector((state: RootState) => state.messages.onlineUsers);
  const isOnline = otherParticipant?.id ? onlineUsers.includes(otherParticipant.id) : false;

  // Format last seen time
  const formatLastSeen = (lastSeenAt?: string): string => {
    if (!lastSeenAt) return 'Không hoạt động';

    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Vừa mới truy cập';
    if (diffMinutes < 60) return `Hoạt động ${diffMinutes} phút trước`;
    if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`;
    if (diffDays < 7) return `Hoạt động ${diffDays} ngày trước`;

    return lastSeen.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
  };

  const statusText = isOnline ? 'Đang hoạt động' : formatLastSeen(otherParticipant?.lastSeenAt);

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b flex items-center gap-3 bg-background/95 backdrop-blur-sm">
        <div className="relative">
          {chatPartnerAvatar ? (
            <img
              src={chatPartnerAvatar}
              alt={chatPartnerName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {chatPartnerInitial}
            </div>
          )}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{chatPartnerName}</h3>
          <p className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>{statusText}</p>
        </div>
      </div>

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
