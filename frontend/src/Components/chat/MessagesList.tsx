import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@/types';

interface MessagesListProps {
  messages: Message[];
  loading?: boolean;
}

// Helper function để format ngày
function formatMessageDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Hôm nay';
  if (isYesterday) return 'Hôm qua';

  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

// Kiểm tra xem 2 message có cách nhau > 5 phút không
function shouldShowTime(current: Message, previous?: Message): boolean {
  if (!previous) return true;
  const diff = new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime();
  return diff > 5 * 60 * 1000; // 5 phút
}

// Kiểm tra xem có phải ngày mới không
function isNewDay(current: Message, previous?: Message): boolean {
  if (!previous) return true;
  const currentDate = new Date(current.createdAt).toDateString();
  const previousDate = new Date(previous.createdAt).toDateString();
  return currentDate !== previousDate;
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
    <div className="h-full w-full overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col gap-1">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Bắt đầu cuộc trò chuyện</p>
            <p className="text-gray-400 text-sm mt-1">Gửi tin nhắn đầu tiên của bạn</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const showDateSeparator = isNewDay(message, prevMessage);
            const showTime = shouldShowTime(message, prevMessage);

            return (
              <div key={message._id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1 rounded-full">
                      {formatMessageDate(new Date(message.createdAt))}
                    </div>
                  </div>
                )}

                {/* Time separator (nếu cách > 5 phút) */}
                {!showDateSeparator && showTime && (
                  <div className="flex justify-center my-2">
                    <span className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                <MessageBubble message={message} showTime={index === messages.length - 1} />
              </div>
            );
          })}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
