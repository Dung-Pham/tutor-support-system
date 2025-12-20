import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, MoreHorizontal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import { Comment, Reply } from '@/types/comment';
import { formatMessageTime } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommentForm } from './CommentForm';
import {
  toggleCommentLikeAsync,
  toggleReplyLikeAsync,
  deleteCommentAsync,
  deleteReplyAsync,
  createReplyAsync,
  getRepliesAsync,
} from '@/store/slices/commentSlice';

interface CommentItemProps {
  comment: Comment;
  postId: string;
}

export function CommentItem({ comment, postId }: CommentItemProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { repliesByComment, loadingReplies } = useSelector((state: RootState) => state.comments);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [localLiked, setLocalLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(comment.like_count || 0);

  const isAuthor = user?.id === comment.accountId._id;
  const replies = repliesByComment[comment._id] || [];
  const hasReplies = comment.reply_count > 0;

  const handleLike = async () => {
    // Optimistic update
    setLocalLiked(!localLiked);
    setLocalLikeCount((prev: number) => (localLiked ? prev - 1 : prev + 1));

    try {
      const result = await dispatch(
        toggleCommentLikeAsync({ commentId: comment._id, postId })
      ).unwrap();
      // Sync with server response
      setLocalLikeCount(result.likeCount);
      setLocalLiked(result.liked);
    } catch {
      // Revert on error
      setLocalLiked(localLiked);
      setLocalLikeCount(comment.like_count || 0);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn chắc chắn muốn xóa bình luận này?')) {
      await dispatch(deleteCommentAsync({ commentId: comment._id, postId }));
    }
  };

  const handleReplySubmit = async (content: string) => {
    await dispatch(createReplyAsync({ commentId: comment._id, postId, content })).unwrap();
    setShowReplyForm(false);
    setShowReplies(true);
  };

  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0 && hasReplies) {
      await dispatch(getRepliesAsync({ commentId: comment._id, page: 1, limit: 10 }));
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className="group">
      {/* Main Comment */}
      <div className="flex gap-3">
        {/* Avatar */}
        <img
          src={
            comment.accountId.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.accountId._id}`
          }
          alt={comment.accountId.displayName}
          className="w-9 h-9 rounded-full flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-900">
                {comment.accountId.displayName}
              </span>
              <span className="text-xs text-gray-500">
                {formatMessageTime(new Date(comment.createdAt))}
              </span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {comment.comment_content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1.5 px-2">
            <button
              onClick={handleLike}
              className={`text-xs font-medium transition ${
                localLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <Heart size={14} fill={localLiked ? 'currentColor' : 'none'} />
                {localLikeCount > 0 && <span>{localLikeCount}</span>}
              </span>
            </button>

            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 transition"
            >
              Trả lời
            </button>

            {hasReplies && (
              <button
                onClick={handleToggleReplies}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition inline-flex items-center gap-1"
              >
                {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {comment.reply_count} trả lời
              </button>
            )}

            {/* More actions */}
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition">
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Xóa bình luận
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 pl-2">
              <CommentForm
                onSubmit={handleReplySubmit}
                placeholder={`Trả lời ${comment.accountId.displayName}...`}
                buttonText="Trả lời"
                autoFocus
                showCancel
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Replies */}
          {showReplies && (
            <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-200">
              {loadingReplies[comment._id] ? (
                <div className="text-sm text-gray-500 py-2">Đang tải...</div>
              ) : (
                replies.map((reply) => (
                  <ReplyItem
                    key={reply._id}
                    reply={reply}
                    commentId={comment._id}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reply Item Component
interface ReplyItemProps {
  reply: Reply;
  commentId: string;
  currentUserId?: string;
}

function ReplyItem({ reply, commentId, currentUserId }: ReplyItemProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [localLiked, setLocalLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(reply.like_count || 0);

  const isAuthor = currentUserId === reply.accountId._id;

  const handleLike = async () => {
    setLocalLiked(!localLiked);
    setLocalLikeCount((prev: number) => (localLiked ? prev - 1 : prev + 1));

    try {
      const result = await dispatch(
        toggleReplyLikeAsync({ replyId: reply._id, commentId })
      ).unwrap();
      // Sync with server response
      setLocalLikeCount(result.likeCount);
      setLocalLiked(result.liked);
    } catch {
      setLocalLiked(localLiked);
      setLocalLikeCount(reply.like_count || 0);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn chắc chắn muốn xóa trả lời này?')) {
      await dispatch(deleteReplyAsync({ replyId: reply._id, commentId }));
    }
  };

  return (
    <div className="flex gap-2.5 group/reply">
      <img
        src={
          reply.accountId.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.accountId._id}`
        }
        alt={reply.accountId.displayName}
        className="w-7 h-7 rounded-full flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-xs text-gray-900">
              {reply.accountId.displayName}
            </span>
            <span className="text-xs text-gray-500">
              {formatMessageTime(new Date(reply.createdAt))}
            </span>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
            {reply.reply_comment_content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1 px-2">
          <button
            onClick={handleLike}
            className={`text-xs font-medium transition ${
              localLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <Heart size={12} fill={localLiked ? 'currentColor' : 'none'} />
              {localLikeCount > 0 && <span>{localLikeCount}</span>}
            </span>
          </button>

          {isAuthor && (
            <button
              onClick={handleDelete}
              className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover/reply:opacity-100 transition"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
