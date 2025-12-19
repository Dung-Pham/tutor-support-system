import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
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
      <div className="h-full w-full overflow-y-auto p-3 sm:p-4 md:p-6 gap-2 sm:gap-3 flex flex-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 sm:h-12 w-2/3 sm:w-3/4 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4">
      {messages.length === 0 ? (
        <div
          className="flex items-center justify-center h-full"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <p className="text-sm md:text-base">Bắt đầu cuộc trò chuyện</p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <MessageBubble
              key={message._id}
              message={message}
              showTime={index === messages.length - 1}
            />
          ))}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
