import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@/types';
import { MessageCircle } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Section Header */}
      <div className="px-4 py-3 flex items-center gap-2 bg-secondary/30">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          Tin nhắn
        </span>
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
