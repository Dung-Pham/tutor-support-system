import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface TypingIndicatorProps {
  conversationId: string;
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const typing = useSelector((state: RootState) => state.messages.typing);

  if (!typing || typing.users.length === 0 || typing.conversationId !== conversationId) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        <span
          className="w-2 h-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: '0.2s' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
      <span className="text-xs text-muted-foreground">đang nhập...</span>
    </div>
  );
}
