import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Message, User } from '@/types';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface MessageBubbleProps {
  message: Message;
  showTime?: boolean;
}

export function MessageBubble({ message, showTime = false }: MessageBubbleProps) {
  const currentUser = useSelector((state: RootState) => state.auth.user) as User | null;

  // So sánh senderId với currentUser id (hỗ trợ cả id và _id)
  const currentUserId = (currentUser as any)?._id || (currentUser as any)?.id;
  const isOwn = currentUserId && message.senderId === currentUserId;

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

      <div
        className={`flex flex-col gap-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ${isOwn ? 'items-end' : 'items-start'}`}
      >
        {/* Display images if present - without background wrapper */}
        {message.imgUrls && message.imgUrls.length > 0 && (
          <div
            className={`grid gap-1 rounded-lg overflow-hidden ${
              message.imgUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            {message.imgUrls.map((url, index) => {
              const totalImages = message.imgUrls?.length || 0;
              const isLastImage = index === totalImages - 1;
              const isOddCount = totalImages % 2 === 1;
              const shouldAlignRight = isOddCount && isLastImage && totalImages > 1;

              return (
                <img
                  key={index}
                  src={url}
                  alt={`Image ${index + 1}`}
                  loading="lazy"
                  className={`w-full h-auto max-h-48 sm:max-h-56 md:max-h-64 lg:max-h-72 object-cover rounded cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all duration-200 ${
                    shouldAlignRight ? 'col-start-2' : ''
                  }`}
                  onClick={() => window.open(url, '_blank')}
                />
              );
            })}
          </div>
        )}

        {/* Display text content if present */}
        {message.content && (
          <div
            className="rounded-lg break-words px-3 py-2"
            style={{
              backgroundColor: isOwn ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
              color: isOwn ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
            }}
          >
            <p className="text-base">{message.content}</p>
          </div>
        )}

        {showTime && (
          <span className="text-base font-medium text-muted-foreground block mt-3">
            {messageTime}
          </span>
        )}
      </div>
    </div>
  );
}
