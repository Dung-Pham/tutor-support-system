/**
 * File: components/chat/TypingIndicator.tsx
 * Mục đích: Hiển thị ai đang typing
 */

import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export function TypingIndicator() {
  const typing = useSelector((state: RootState) => state.messages.typing);

  if (!typing || typing.users.length === 0) {
    return null;
  }

  const typingUsers = typing.users.join(', ');

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <span
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        />
        <span
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ backgroundColor: 'hsl(var(--primary))', animationDelay: '0.2s' }}
        />
        <span
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ backgroundColor: 'hsl(var(--primary))', animationDelay: '0.4s' }}
        />
      </div>
      <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {typingUsers} đang nhập...
      </span>
    </div>
  );
}
