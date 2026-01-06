import { Link, useLocation } from 'react-router-dom';
import { Post, PostStatus } from '@/types/post';
import { formatMessageTime } from '@/lib/utils';
import { extractImageUrlsFromTiptapJson } from '@/lib/tiptap-utils';
import { Edit2, Eye, Share2, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PostCardProps {
  post: Post;
  isAuthor?: boolean;
  isCommunity?: boolean; // ← Hiển thị dạng cộng đồng
  linkState?: unknown;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onView?: (postId: string) => void;
}

const statusConfig: Record<PostStatus, { label: string; bgColor: string; textColor: string }> = {
  draft: { label: 'Nháp', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  pending: { label: 'Chờ duyệt', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  approved: { label: 'Đã duyệt', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  rejected: { label: 'Từ chối', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  deleted: { label: 'Đã xóa', bgColor: 'bg-gray-200', textColor: 'text-gray-500' },
};

export function PostCard({
  post,
  isAuthor = false,
  isCommunity = false,
  linkState,
  onEdit,
  onDelete,
  onView,
}: PostCardProps) {
  const location = useLocation();
  const statusInfo = statusConfig[post.status];
  // Cho phép edit cả draft và pending
  const canEdit = isAuthor && ['draft', 'pending'].includes(post.status);
  // Chỉ cho xóa draft và pending
  const canDelete = isAuthor && ['draft', 'pending'].includes(post.status);

  const plain = (post.contentPlain ?? '').trim();
  const summary = plain.length > 150 ? `${plain.substring(0, 150)}...` : plain;
  const imageUrls = extractImageUrlsFromTiptapJson(post.contentJson);

  // Build URL với slug - giữ nguyên prefix layout hiện tại
  const getPostUrl = () => {
    const slug = post.slug ? `/${post.slug}` : '';
    const basePath = `/posts/${post.id}${slug}`;

    // Nếu đang trong layout tutor/student, giữ prefix đó
    if (location.pathname.startsWith('/tutor')) {
      return `/tutor/posts/${post.id}${slug}`;
    }
    if (location.pathname.startsWith('/student')) {
      return `/student/posts/${post.id}${slug}`;
    }
    // Mặc định cho guest
    return basePath;
  };

  const postUrl = getPostUrl();

  // Dạng community (danh sách công khai)
  if (isCommunity) {
    return (
      <Link to={postUrl} state={linkState} className="block touch-manipulation group">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 active:shadow-md transition-all duration-300 p-4 sm:p-5">
          {/* Header: Avatar + Info + Stats */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={
                post.author.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`
              }
              alt={post.author.name || post.author.displayName || 'Author'}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all"
            />
            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                {post.author.name || post.author.displayName}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {formatMessageTime(new Date(post.createdAt))}
              </p>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-3 sm:gap-4 text-sm text-gray-500 flex-shrink-0">
              <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                <Eye size={15} className="flex-shrink-0" />
                <span className="tabular-nums">{post.viewCount || 0}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                <Heart size={15} className="flex-shrink-0" />
                <span className="tabular-nums">{post.likeCount || 0}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-green-500 transition-colors">
                <MessageCircle size={15} className="flex-shrink-0" />
                <span className="tabular-nums">{post.commentCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
            {post.title}
          </h2>

          {/* Summary */}
          {summary && (
            <p className="text-sm sm:text-base text-gray-600 line-clamp-3 leading-relaxed">
              {summary}
            </p>
          )}
        </div>
      </Link>
    );
  }

  // Dạng tutor (bài viết của tôi)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Thời gian tạo và cập nhật */}
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-500">Tạo lúc:</span>{' '}
              {new Date(post.createdAt).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <p className="text-xs text-gray-400 mt-0.5">
                Cập nhật:{' '}
                {new Date(post.updatedAt).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Status & Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status Badge */}
          <span
            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusInfo.bgColor} ${statusInfo.textColor}`}
          >
            {statusInfo.label}
          </span>

          {/* View Button */}
          {onView && (
            <Button size="sm" variant="ghost" onClick={() => onView(post.id)} className="gap-1 h-8">
              <Eye size={16} />
              <span className="hidden sm:inline text-xs">Xem</span>
            </Button>
          )}

          {/* Share Button */}
          <Button size="sm" variant="ghost" className="gap-1 h-8">
            <Share2 size={16} />
            <span className="hidden sm:inline text-xs">Chia sẻ</span>
          </Button>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h2>

      {/* Rejection Reason (if applicable) */}
      {post.status === 'rejected' && post.rejectionReason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs font-semibold text-red-700 mb-1">Lý do từ chối:</p>
          <p className="text-sm text-red-600">{post.rejectionReason}</p>
        </div>
      )}

      {/* Approved Info (if applicable) */}
      {post.status === 'approved' && post.approvedAt && (
        <div className="mb-4 text-xs text-gray-500">
          Đã duyệt lúc: {formatMessageTime(new Date(post.approvedAt))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Eye size={16} />
          <span className="tabular-nums">{post.viewCount || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart size={16} />
          <span className="tabular-nums">{post.likeCount || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={16} />
          <span className="tabular-nums">{post.commentCount || 0}</span>
        </div>
      </div>

      {/* Action Buttons - Edit và Delete */}
      <div className="flex gap-2 mt-3">
        {canEdit && onEdit && (
          <Button size="sm" variant="outline" onClick={() => onEdit(post.id)} className="gap-2">
            <Edit2 size={16} />
            <span className="hidden sm:inline">Chỉnh sửa</span>
          </Button>
        )}
        {canDelete && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Xóa</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa vĩnh viễn bài viết?</AlertDialogTitle>
                <AlertDialogDescription className="text-red-600 font-medium">
                  Bạn chắc chắn muốn xóa bài viết này? Hành động này sẽ xóa vĩnh viễn và không thể
                  khôi phục.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(post.id)}
                >
                  Xóa vĩnh viễn
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
