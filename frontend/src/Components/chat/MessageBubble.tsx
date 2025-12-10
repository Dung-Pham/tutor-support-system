/**
 * File: components/chat/MessageBubble.tsx
 * Mục đích: Một message bubble
 */

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';
import type { Message, User } from '@/types';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const currentUser = useSelector((state: RootState) => state.auth.user) as User | null;
  const isOwn = currentUser && message.senderId === currentUser._id;

  const messageTime = new Date(message.createdAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback
            style={{
              backgroundColor: 'hsl(var(--primary) / 0.1)',
              color: 'hsl(var(--primary))',
            }}
            className="text-xs font-semibold"
          >
            {'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col gap-1 max-w-xs ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className="px-3 py-2 rounded-lg break-words"
          style={{
            backgroundColor: isOwn ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
            color: isOwn ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
          }}
        >
          <p className="text-sm">{message.content}</p>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {messageTime}
          </span>
          {isOwn && message.status === 'seen' && (
            <CheckCheck className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
          )}
          {isOwn && message.status === 'delivered' && (
            <Check className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
          )}
        </div>
      </div>
    </div>
  );
}
