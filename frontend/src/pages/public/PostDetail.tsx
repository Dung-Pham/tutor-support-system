/**
 * File: pages/public/PostDetail.tsx
 * Mục đích: Trang hiển thị chi tiết một bài viết cộng đồng
 */

import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Heart, MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { PostDetail } from '@/types/post';
import * as postService from '@/services/postService';
import { formatMessageTime } from '@/lib/utils';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const backTo = (location.state as { backTo?: string } | null)?.backTo || '/posts';
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
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-3 text-gray-900">{post.title}</h1>
      <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
        <img
          src={
            post.author.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author._id}`
          }
          alt={post.author.displayName}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{post.author.displayName}</span>
          <span>{formatMessageTime(new Date(post.createdAt))}</span>
        </div>
        <div className="flex items-center gap-4 ml-auto text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Eye size={14} /> {post.viewCount || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart size={14} /> {post.likeCount || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={14} /> {post.commentCount || 0}
          </span>
        </div>
      </div>

      <div
        className="prose max-w-none prose-headings:mb-3 prose-p:my-3"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}
