import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setActiveConversation } from '@/store/slices/messagesSlice';
import type { RootState } from '@/store';
import type { Conversation, UserRole } from '@/types';
import { OnlineStatus } from './OnlineStatus';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
}

// Role badge configuration
const ROLE_BADGES: Record<UserRole, { label: string; className: string }> = {
  tutor: { label: 'Gia sư', className: 'bg-blue-100 text-blue-700' },
  student: { label: 'Học sinh', className: 'bg-green-100 text-green-700' },
  admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700' },
};

export function ConversationItem({ conversation }: ConversationItemProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const activeConversation = useSelector((state: RootState) => state.messages.activeConversation);
  const unreadCount = useSelector(
    (state: RootState) => state.messages.unreadCounts[conversation.id] || 0
  );

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isActive = activeConversation?.id === conversation.id;

  // Lấy thông tin người chat (participant còn lại, không phải current user)
  const currentUserId = currentUser?.user_id;
  const otherParticipant = conversation.participants.find(
    (p) => p.id?.toUpperCase() !== currentUserId?.toUpperCase()
  );
  const otherParticipantId = otherParticipant?.id || '';
  const conversationName = otherParticipant?.name || otherParticipant?.displayName || 'Unknown User';
  const avatarUrl = otherParticipant?.avatarUrl;
  const otherParticipantRole = otherParticipant?.role;

  // Badge config cho role
  const roleBadge = otherParticipantRole ? ROLE_BADGES[otherParticipantRole] : null;

  // Màu gradient cho avatar dựa trên chữ cái đầu
  const getAvatarGradient = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
      'from-indigo-500 to-indigo-600',
      'from-rose-500 to-rose-600',
    ];
    const charCode = (name[0] || 'U').toUpperCase().charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Format thời gian thông minh
  const formatMessageTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  const lastMessage =
    conversation.lastMessage?.content || conversation.lastMessagePreview || 'Không có tin nhắn';
  const lastMessageTime = conversation.lastMessageAt
    ? formatMessageTime(conversation.lastMessageAt)
    : '';

  const handleClick = () => {
    dispatch(setActiveConversation(conversation));
    // Update URL with conversation ID
    const basePath = location.pathname.includes('/student/')
      ? '/student/messages'
      : '/tutor/messages';
    navigate(`${basePath}/${conversation.id}`, { replace: true });
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 p-3 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200',
        'hover:bg-secondary/60 hover:shadow-sm',
        isActive && 'bg-primary/10 shadow-sm ring-1 ring-primary/20',
        !isActive && 'hover:scale-[1.01]'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={conversationName}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        ) : (
          <div
            className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarGradient(conversationName)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
          >
            {conversationName[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <OnlineStatus userId={otherParticipantId} size="md" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <p className="font-semibold text-sm text-foreground truncate">{conversationName}</p>
            {roleBadge && (
              <span
                className={`hidden lg:inline-flex flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${roleBadge.className}`}
              >
                {roleBadge.label}
              </span>
            )}
          </div>
          <p className="hidden lg:block text-xs text-muted-foreground flex-shrink-0 ml-2">{lastMessageTime}</p>
        </div>
        <p className="hidden lg:block text-sm truncate text-muted-foreground">{lastMessage}</p>
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
