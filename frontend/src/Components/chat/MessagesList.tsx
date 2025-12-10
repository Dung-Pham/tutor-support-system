/**
 * File: components/chat/MessagesList.tsx
 * Mục đích: Danh sách messages
 */

import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from '@/types';

interface MessagesListProps {
  messages: Message[];
  loading?: boolean;
}

export function MessagesList({ messages, loading }: MessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 gap-3 flex flex-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-3/4 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {messages.length === 0 ? (
        <div
          className="flex items-center justify-center h-full"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <p className="text-sm">Bắt đầu cuộc trò chuyện</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble key={message._id} message={message} />
          ))}
          <TypingIndicator />
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
