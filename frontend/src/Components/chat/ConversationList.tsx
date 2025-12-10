/**
 * File: components/chat/ConversationList.tsx
 * Mục đích: Danh sách conversations
 */

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@/types';

interface ConversationListProps {
  conversations: Conversation[];
  loading?: boolean;
}

export function ConversationList({ conversations, loading }: ConversationListProps) {
  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-3 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <Input
          placeholder="Tìm cuộc trò chuyện..."
          className="h-9 text-sm"
          style={{
            borderColor: 'hsl(var(--input))',
            backgroundColor: 'hsl(var(--input))',
            color: 'hsl(var(--foreground))',
          }}
        />
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <p className="text-sm">Không có cuộc trò chuyện</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem key={conversation._id} conversation={conversation} />
          ))
        )}
      </div>
    </div>
  );
}
