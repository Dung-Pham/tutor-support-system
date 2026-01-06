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
      <div className="container mx-auto px-4 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 text-center space-y-4">
        <p className="text-red-500 font-medium">{error || 'Bài viết không tồn tại'}</p>
        <Link to={backTo} className="text-blue-600 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 lg:px-8">
      {/* Back button */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </Link>
      </div>

      {/* Article Header */}
      <article className="bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
        <div className="p-6 sm:p-10">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent leading-tight">
            {post.title}
          </h1>

          {/* Author & Stats */}
          <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <img
                src={
                  post.author.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`
                }
                alt={post.author.name || post.author.displayName}
                className="w-12 h-12 rounded-full ring-2 ring-blue-100 shadow-sm"
              />
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-base">{post.author.name || post.author.displayName}</span>
                <span className="text-sm text-gray-500">
                  {formatMessageTime(new Date(post.createdAt))}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
                <Eye size={18} />
                <span className="tabular-nums">{post.viewCount || 0}</span>
              </span>

              {/* Like Button */}
              <LikeButton postId={post.id} initialLikeCount={post.likeCount || 0} size="md" />

              {/* Comment count */}
              <a
                href="#comments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition text-sm font-medium"
              >
                <MessageCircle size={18} />
                <span className="tabular-nums">{commentsTotal || post.commentCount || 0}</span>
              </a>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-full hover:bg-gray-100"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // TODO: Show toast
                }}
              >
                <Share2 size={18} />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="pt-8 prose prose-gray prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed">
            <TiptapRenderer content={post.contentJson} />
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div id="comments">
        <CommentSection
          postId={post.id}
          commentCount={post.commentCount || 0}
          postAuthorId={post.author?.id}
        />
      </div>
    </div>
  );
}
