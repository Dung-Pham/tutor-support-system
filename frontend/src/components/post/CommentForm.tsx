import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
}

export function CommentForm({
  onSubmit,
  placeholder = 'Viết bình luận...',
  buttonText = 'Gửi',
  autoFocus = false,
  onCancel,
  showCancel = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-5 text-center border border-gray-100">
        <p className="text-gray-600">
          Vui lòng{' '}
          <a href="/login" className="text-blue-600 hover:underline font-semibold">
            đăng nhập
          </a>{' '}
          để bình luận
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      {/* Avatar */}
      <img
        src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
        alt={user?.displayName}
        className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-gray-100"
      />

      {/* Input area */}
      <div className="flex-1 space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={3}
          className="resize-none min-h-[80px] border-gray-200 focus:border-blue-400 focus:ring-blue-100 rounded-xl text-base"
          disabled={isSubmitting}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {showCancel && onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-full"
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isSubmitting}
            className="gap-2 rounded-full px-5 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {buttonText}
          </Button>
        </div>
      </div>
    </form>
  );
}
