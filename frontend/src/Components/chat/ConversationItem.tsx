import { useDispatch, useSelector } from 'react-redux';
import { setActiveConversation } from '@/store/slices/messagesSlice';
import type { RootState } from '@/store';
import type { Conversation } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OnlineStatus } from './OnlineStatus';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const dispatch = useDispatch();
  const activeConversation = useSelector((state: RootState) => state.messages.activeConversation);
  const unreadCount = useSelector(
    (state: RootState) => state.messages.unreadCounts[conversation.id] || 0
  );

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isActive = activeConversation?.id === conversation.id;

  // Lấy thông tin người chat (participant còn lại, không phải current user)
  const currentUserId = currentUser?.id;
  const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId);
  const otherParticipantId = otherParticipant?.id || '';
  const conversationName = otherParticipant?.displayName || 'Unknown User';
  const avatarUrl = otherParticipant?.avatarUrl;

  const lastMessage = conversation.lastMessage?.content || conversation.lastMessagePreview || 'Không có tin nhắn';
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
        'flex items-center gap-3 p-3 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200',
        'hover:bg-secondary/60 hover:shadow-sm',
        isActive && 'bg-primary/10 shadow-sm ring-1 ring-primary/20',
        !isActive && 'hover:scale-[1.01]'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-11 h-11 ring-2 ring-border shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt={conversationName} className="w-full h-full object-cover" />
          ) : (
            <AvatarFallback className="font-bold text-sm bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
              {conversationName[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        <OnlineStatus userId={otherParticipantId} size="md" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-sm text-foreground truncate pr-2">{conversationName}</p>
          <p className="text-xs text-muted-foreground flex-shrink-0">{lastMessageTime}</p>
        </div>
        <p className="text-sm truncate text-muted-foreground">{lastMessage}</p>
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-primary-foreground bg-primary shadow-sm flex-shrink-0 animate-in fade-in zoom-in duration-200">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  );
}
