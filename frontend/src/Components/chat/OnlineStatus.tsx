import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { cn } from '@/lib/utils';

interface OnlineStatusProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OnlineStatus({ userId, size = 'md', className }: OnlineStatusProps) {
  const onlineUsers = useSelector((state: RootState) => state.messages.onlineUsers);
  const isOnline = onlineUsers.includes(userId);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <span
      className={cn(
        'absolute bottom-0 right-0 rounded-full border-2 border-background',
        sizeClasses[size],
        isOnline ? 'bg-green-500' : 'bg-gray-400',
        className
      )}
      title={isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
    />
  );
}
