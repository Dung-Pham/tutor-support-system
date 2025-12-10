/**
 * File: components/chat/ConversationItem.tsx
 * Mục đích: Một item trong conversation list
 */

import { useDispatch, useSelector } from 'react-redux';
import { setActiveConversation } from '@/store/slices/messagesSlice';
import type { RootState } from '@/store';
import type { Conversation } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const dispatch = useDispatch();
  const activeConversation = useSelector((state: RootState) => state.messages.activeConversation);
  const unreadCount = useSelector(
    (state: RootState) => state.messages.unreadCounts[conversation._id] || 0
  );

  const isActive = activeConversation?._id === conversation._id;
  const conversationName = conversation.group?.name || 'Group Chat';
  const lastMessage = conversation.lastMessage?.content || 'Không có tin nhắn';
  const lastMessageTime = conversation.lastMessageAt
    ? new Date(conversation.lastMessageAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      onClick={() => dispatch(setActiveConversation(conversation))}
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer transition-all duration-200',
        'hover:bg-secondary',
        isActive && 'bg-secondary border-l-4',
        'border-l-4 border-l-transparent'
      )}
      style={{
        backgroundColor: isActive ? 'hsl(var(--secondary))' : 'transparent',
        borderLeftColor: isActive ? 'hsl(var(--primary))' : 'transparent',
      }}
    >
      {/* Avatar */}
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarFallback
          style={{
            backgroundColor: 'hsl(var(--primary) / 0.1)',
            color: 'hsl(var(--primary))',
          }}
          className="font-semibold"
        >
          {conversationName[0]?.toUpperCase() || 'G'}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-sm" style={{ color: 'hsl(var(--foreground))' }}>
            {conversationName}
          </p>
          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {lastMessageTime}
          </p>
        </div>
        <p className="text-sm truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {lastMessage}
        </p>
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <div
          className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold text-white flex-shrink-0"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  );
}
