/**
 * File: components/chat/ChatSidebar.tsx
 * Mục đích: Sidebar cho chức năng chat
 * Hiển thị: GroupConversationList + DirectConversationList
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { GroupConversationList } from './GroupConversationList';
import { DirectConversationList } from './DirectConversationList';
import type { Conversation } from '@/types';

interface ChatSidebarProps {
  conversations: Conversation[];
  loading?: boolean;
}

export function ChatSidebar({ conversations, loading }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Phân chia conversations thành group và direct
  const groupConversations = conversations.filter((conv) => conv.type === 'group');
  const directConversations = conversations.filter((conv) => conv.type === 'direct');

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search bar */}
      <div
        className="p-3 border-b sticky top-0 bg-background"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <Input
          placeholder="Tìm cuộc trò chuyện..."
          className="h-9 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            borderColor: 'hsl(var(--input))',
            backgroundColor: 'hsl(var(--input))',
            color: 'hsl(var(--foreground))',
          }}
        />
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        <GroupConversationList conversations={groupConversations} />
        <DirectConversationList conversations={directConversations} />

        {/* Empty state */}
        {groupConversations.length === 0 && directConversations.length === 0 && (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <p className="text-sm">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Không có cuộc trò chuyện'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
