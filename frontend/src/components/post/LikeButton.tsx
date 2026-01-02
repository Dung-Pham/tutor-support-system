import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import { togglePostLikeAsync, checkPostLikeAsync } from '@/store/slices/postSlice';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  postId: string;
  initialLikeCount?: number;
  initialLiked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function LikeButton({
  postId,
  initialLikeCount = 0,
  initialLiked = false,
  size = 'md',
  showCount = true,
  className,
}: LikeButtonProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const likedPosts = useSelector((state: RootState) => state.posts.likedPosts);

  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if post is liked on mount
  useEffect(() => {
    if (isAuthenticated && likedPosts[postId] === undefined) {
      dispatch(checkPostLikeAsync(postId));
    }
  }, [dispatch, postId, isAuthenticated, likedPosts]);

  // Sync with redux state
  useEffect(() => {
    if (likedPosts[postId] !== undefined) {
      setIsLiked(likedPosts[postId]);
    }
  }, [likedPosts, postId]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show modal
      window.location.href = '/login';
      return;
    }

    // Optimistic update with animation
    setIsAnimating(true);
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      const result = await dispatch(togglePostLikeAsync(postId)).unwrap();
      setLikeCount(result.likeCount);
    } catch {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(initialLikeCount);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const sizeConfig = {
    sm: { icon: 16, text: 'text-xs', padding: 'px-2 py-1' },
    md: { icon: 18, text: 'text-sm', padding: 'px-3 py-1.5' },
    lg: { icon: 22, text: 'text-base', padding: 'px-4 py-2' },
  };

  const config = sizeConfig[size];

  return (
    <button
      onClick={handleLike}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full transition-all duration-200',
        config.padding,
        isLiked
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800',
        isAnimating && 'scale-110',
        className
      )}
    >
      <Heart
        size={config.icon}
        fill={isLiked ? 'currentColor' : 'none'}
        className={cn(
          'transition-transform duration-200',
          isAnimating && 'animate-[heartBeat_0.3s_ease-in-out]'
        )}
      />
      {showCount && (
        <span className={cn(config.text, 'font-medium tabular-nums')}>{likeCount}</span>
      )}
    </button>
  );
}
