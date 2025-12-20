import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Eye, MessageCircle, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { TiptapRenderer } from '@/components/post/TiptapRenderer';
import { LikeButton } from '@/components/post/LikeButton';
import { CommentSection } from '@/components/post/CommentSection';
import type { PostDetail } from '@/types/post';
import type { RootState } from '@/store';
import * as postService from '@/services/postService';
import { formatMessageTime } from '@/lib/utils';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Subscribe to comment total from Redux for real-time update
  const commentsTotal = useSelector((state: RootState) => state.comments.commentsTotal);

  // Tính toán backTo dựa vào layout hiện tại
  const getBackUrl = () => {
    // Nếu có state từ navigation, ưu tiên dùng
    const stateBackTo = (location.state as { backTo?: string } | null)?.backTo;
    if (stateBackTo) return stateBackTo;

    // Dựa vào pathname để xác định layout
    if (location.pathname.startsWith('/tutor/posts')) {
      return '/tutor/posts';
    }
    if (location.pathname.startsWith('/student/posts')) {
      return '/student/posts';
    }
    return '/posts';
  };

  const backTo = getBackUrl();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await postService.getPostDetail(id);
        setPost(data);
      } catch (err) {
        console.error('Failed to load post detail', err);
        setError('Không thể tải bài viết');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto max-w-3xl py-12 text-center space-y-4">
        <p className="text-red-500 font-medium">{error || 'Bài viết không tồn tại'}</p>
        <Link to={backTo} className="text-blue-600 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      {/* Back button */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:underline transition"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>
      </div>

      {/* Article Header */}
      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 leading-tight">
            {post.title}
          </h1>

          {/* Author & Stats */}
          <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={
                  post.author.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author._id}`
                }
                alt={post.author.displayName}
                className="w-10 h-10 rounded-full ring-2 ring-gray-100"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{post.author.displayName}</span>
                <span className="text-sm text-gray-500">
                  {formatMessageTime(new Date(post.createdAt))}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                <Eye size={16} />
                <span className="tabular-nums">{post.viewCount || 0}</span>
              </span>

              {/* Like Button */}
              <LikeButton postId={post._id} initialLikeCount={post.likeCount || 0} size="md" />

              {/* Comment count */}
              <a
                href="#comments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition text-sm font-medium"
              >
                <MessageCircle size={18} />
                <span className="tabular-nums">{commentsTotal || post.commentCount || 0}</span>
              </a>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // TODO: Show toast
                }}
              >
                <Share2 size={16} />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="pt-6 prose prose-gray prose-lg max-w-none">
            <TiptapRenderer content={post.contentJson} />
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div id="comments">
        <CommentSection postId={post._id} commentCount={post.commentCount || 0} />
      </div>
    </div>
  );
}
