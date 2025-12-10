/**
 * File: components/chat/MessageInput.tsx
 * Mục đích: Input field cho messages
 */

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage } from '@/store/slices/messagesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import * as messageService from '@/services/messageService';

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const dispatch = useDispatch();

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      const response = await messageService.sendMessage({
        conversationId,
        content: message,
      });

      // Add message to Redux
      if (response.data) {
        dispatch(addMessage(response.data));
      }

      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex items-center gap-2 p-4 border-t"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Nhập tin nhắn..."
        disabled={sending}
        className="flex-1 h-10 text-sm"
        style={{
          borderColor: 'hsl(var(--input))',
          backgroundColor: 'hsl(var(--input))',
          color: 'hsl(var(--foreground))',
        }}
      />

      <Button
        onClick={handleSend}
        disabled={!message.trim() || sending}
        size="icon"
        className="h-10 w-10"
        style={{
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
        }}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
