import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConversationList } from './ConversationList';
import type { Conversation } from '@/types';
import { Search, MessageSquare } from 'lucide-react';

interface ChatSidebarProps {
  conversations: Conversation[];
  loading?: boolean;
}

export function ChatSidebar({ conversations, loading }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Chỉ lấy direct conversations (1-1 chat) và sắp xếp theo tin nhắn gần nhất
  const directConversations = conversations
    .filter((conv) => conv.type === 'direct')
    .filter((conv) => {
      if (!searchQuery.trim()) return true;
      // Tìm theo tên participant
      const participantNames = conv.participants.map((p) => p.name?.toLowerCase() || '');
      return participantNames.some((name) => name.includes(searchQuery.toLowerCase()));
    })
    .sort((a, b) => {
      // Sắp xếp theo lastMessageAt giảm dần (mới nhất lên đầu)
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    });

  if (loading) {
    return (
      <div className="flex flex-col h-full p-2 sm:p-3 md:p-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 sm:h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search bar */}
      <div className="p-2 sm:p-3 md:p-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            className="h-8 sm:h-9 md:h-10 pl-10 text-xs sm:text-sm bg-secondary/50 border-secondary focus-visible:ring-primary/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        <ConversationList conversations={directConversations} />

        {/* Empty state */}
        {directConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">
              {searchQuery ? 'Không tìm thấy' : 'Chưa có tin nhắn'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Bắt đầu trò chuyện với bạn bè của bạn'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
