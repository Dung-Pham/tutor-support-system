/**
 * File: components/chat/ChatHeader.tsx
 * Mục đích: Header của chat box
 */

import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/types';

interface ChatHeaderProps {
  conversation: Conversation;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const conversationName = conversation.group?.name || 'Group Chat';
  const memberCount = conversation.participants?.length || 0;

  return (
    <div
      className="flex items-center justify-between h-16 px-6 border-b"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      <div>
        <p className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
          {conversationName}
        </p>
        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {memberCount} thành viên
        </p>
      </div>

      <Button variant="ghost" size="icon">
        <MoreVertical className="w-5 h-5" />
      </Button>
    </div>
  );
}
