/**
 * File: components/chat/GroupConversationList.tsx
 * Mục đích: Danh sách cuộc hội thoại nhóm
 */

import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@/types';
import { Users } from 'lucide-react';

interface GroupConversationListProps {
  conversations: Conversation[];
}

export function GroupConversationList({ conversations }: GroupConversationListProps) {
  if (conversations.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Section Header */}
      <div
        className="px-4 py-3 flex items-center gap-2 sticky top-0"
        style={{
          backgroundColor: 'hsl(var(--secondary) / 0.3)',
          color: 'hsl(var(--muted-foreground))',
        }}
      >
        <Users className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Nhóm Chat</span>
      </div>

      {/* Conversations List */}
      <div>
        {conversations.map((conversation) => (
          <ConversationItem key={conversation._id} conversation={conversation} />
        ))}
      </div>
    </div>
  );
}
