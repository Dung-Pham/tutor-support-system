import { Link } from 'react-router-dom';
import { Post, PostStatus } from '@/types/post';
import { formatMessageTime } from '@/lib/utils';
import { extractImageUrlsFromTiptapJson } from '@/lib/tiptap-utils';
import { Edit2, Eye, Share2, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
};

export function PostCard({
  post,
  isAuthor = false,
  isCommunity = false,
  linkState,
  onEdit,
  onView,
}: PostCardProps) {
  const statusInfo = statusConfig[post.status];
  const canEdit = isAuthor && post.status === 'draft';

  const plain = (post.contentPlain ?? '').trim();
  const summary = plain.length > 150 ? `${plain.substring(0, 150)}...` : plain;
  const imageUrls = extractImageUrlsFromTiptapJson(post.contentJson);

  // Build URL với slug
  const postUrl = post.slug ? `/posts/${post._id}/${post.slug}` : `/posts/${post._id}`;

  // Dạng community (danh sách công khai)
  if (isCommunity) {
    return (
      <Link to={postUrl} state={linkState} className="block touch-manipulation">
        <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg active:shadow-md transition p-3 sm:p-4">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <img
              src={
                post.author.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author._id}`
              }
              alt={post.author.displayName}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{post.author.displayName}</p>
              <p className="text-xs text-gray-500 truncate">
                {formatMessageTime(new Date(post.createdAt))}
              </p>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-base sm:text-lg font-bold mb-2 line-clamp-2">{post.title}</h2>

          {/* First Image if available */}
          {imageUrls.length > 0 && (
            <img
              src={imageUrls[0]}
              alt={post.title}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
          )}

          {/* Summary */}
          <p className="text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3">
            {summary}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 border-t pt-2 sm:pt-3">
            <div className="flex items-center gap-1">
              <Eye size={14} className="flex-shrink-0" />
              <span className="tabular-nums">{post.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={14} className="flex-shrink-0" />
              <span className="tabular-nums">{post.likeCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={14} className="flex-shrink-0" />
              <span className="tabular-nums">{post.commentCount || 0}</span>
            </div>
          </div>
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
          {/* Author Avatar */}
          <img
            src={
              post.author.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author._id}`
            }
            alt={post.author.displayName}
            className="w-10 h-10 rounded-full"
          />

          {/* Author Info */}
          <div>
            <h4 className="font-semibold text-gray-900">{post.author.displayName}</h4>
            <p className="text-xs text-gray-500">{formatMessageTime(new Date(post.createdAt))}</p>
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
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(post._id)}
              className="gap-1 h-8"
            >
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

      {/* Action Buttons - Edit only */}
      <div className="flex gap-2 mt-3">
        {canEdit && onEdit && (
          <Button size="sm" variant="outline" onClick={() => onEdit(post._id)} className="gap-2">
            <Edit2 size={16} />
            <span className="hidden sm:inline">Chỉnh sửa</span>
          </Button>
        )}
      </div>
    </div>
  );
}
